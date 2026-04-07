pipeline {
    agent any

    environment {
        DEPLOY_USER  = 'jenkins'                      // ← Change to your server username
        DEPLOY_HOST  = '10.10.120.189'
        DEPLOY_PATH  = '/var/www/pde_version_upgrade' // ← Change to your deploy path
        NODE_ENV     = 'production'
    }

    tools {
        nodejs 'NodeJS'   // Must match name in Jenkins → Global Tool Configuration
    }

    stages {

        // ─────────────────────────────────────────
        // 1. CHECKOUT
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code...'
                checkout scm
            }
        }

        // ─────────────────────────────────────────
        // 2. INSTALL DEPENDENCIES
        // ─────────────────────────────────────────
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm packages...'
                sh 'npm ci --prefer-offline'
            }
        }

        // ─────────────────────────────────────────
        // 3. SONARQUBE SCAN  ← Your exact command
        // ─────────────────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube scan...'
                sh """
                    sonar-scanner \
                      -Dsonar.projectKey=PDE_UI \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=http://10.10.120.190:9000 \
                      -Dsonar.login=sqp_ef3a9d2c7285f451f1071574714c46e62f9e8d3a
                """
            }
        }

        // ─────────────────────────────────────────
        // 4. QUALITY GATE
        // ─────────────────────────────────────────
        stage('Quality Gate') {
            steps {
                echo '🚦 Checking SonarQube Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ─────────────────────────────────────────
        // 5. BUILD
        // ─────────────────────────────────────────
        stage('Build') {
            steps {
                echo '🏗️  Building application...'
                sh 'npm run build --if-present'
            }
        }

        // ─────────────────────────────────────────
        // 6. DEPLOY
        // ─────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo '🚀 Deploying to server...'
                sshagent(credentials: ['jenkins-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                            "mkdir -p ${DEPLOY_PATH}"

                        rsync -avz --delete \
                          --exclude='node_modules' \
                          --exclude='.git' \
                          --exclude='.env' \
                          ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/

                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                            "cd ${DEPLOY_PATH} && npm ci --omit=dev"
                    """
                }
            }
        }

        // ─────────────────────────────────────────
        // 7. PM2 CLUSTER START / RELOAD
        // ─────────────────────────────────────────
        stage('PM2 Cluster Restart') {
            steps {
                echo '⚙️  PM2 zero-downtime cluster reload...'
                sshagent(credentials: ['jenkins-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} bash << 'EOF'
                        cd ${DEPLOY_PATH}
                        export NODE_ENV=production

                        if pm2 describe pde_version_upgrade > /dev/null 2>&1; then
                            echo "Reloading existing cluster..."
                            pm2 reload pde_version_upgrade --update-env
                        else
                            echo "Starting fresh PM2 cluster..."
                            pm2 start ecosystem.config.js --env production
                        fi

                        pm2 save
                        pm2 status
EOF
                    """
                }
            }
        }

    }

    post {
        success {
            echo "✅ SUCCESS — Build #${BUILD_NUMBER} deployed! SonarQube: http://10.10.120.190:9000/dashboard?id=PDE_UI"
        }
        failure {
            echo "❌ FAILED — Check console output for details."
        }
        always {
            cleanWs()
        }
    }
}
