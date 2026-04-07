pipeline {
    agent any

    tools {
        nodejs         'Node20'          // ✅ Your Jenkins NodeJS tool name
        sonarQubeScanner 'sonar-scanner' // ✅ Your SonarQube Scanner tool name
    }

    environment {
        DEPLOY_USER = 'jenkins'                        // ← Change to your server user
        DEPLOY_HOST = '10.10.120.189'                  // ← Your deploy server IP
        DEPLOY_PATH = '/var/www/pde_version_upgrade'   // ← Your deploy directory
        NODE_ENV    = 'production'
    }

    stages {

        // ─────────────────────────────────────────
        // 1. CHECKOUT
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code...'
                git 'https://github.com/SantoshKumar9290/PDE_UI_VERSION_UPGRADE.git'
            }
        }

        // ─────────────────────────────────────────
        // 2. INSTALL DEPENDENCIES
        // ─────────────────────────────────────────
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm packages...'
                sh 'npm install'
            }
        }

        // ─────────────────────────────────────────
        // 3. SONARQUBE SCAN
        // ─────────────────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube scan...'
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=PDE_UI \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://10.10.120.190:9000 \
                          -Dsonar.login=sqp_ef3a9d2c7285f451f1071574714c46e62f9e8d3a
                    """
                }
            }
        }

        // ─────────────────────────────────────────
        // 4. QUALITY GATE
        // ─────────────────────────────────────────
        stage('Quality Gate') {
            steps {
                echo '🚦 Waiting for SonarQube Quality Gate...'
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
                        # Create deploy directory if not exists
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                            "mkdir -p ${DEPLOY_PATH}"

                        # Sync files to server
                        rsync -avz --delete \
                          --exclude='node_modules' \
                          --exclude='.git' \
                          --exclude='.env' \
                          ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/

                        # Install production dependencies on server
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                            "cd ${DEPLOY_PATH} && npm install --omit=dev"
                    """
                }
            }
        }

        // ─────────────────────────────────────────
        // 7. PM2 CLUSTER RESTART
        // ─────────────────────────────────────────
        stage('PM2 Cluster Restart') {
            steps {
                echo '⚙️  Starting PM2 cluster with zero-downtime reload...'
                sshagent(credentials: ['jenkins-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} bash << 'EOF'
                        cd ${DEPLOY_PATH}
                        export NODE_ENV=production

                        if pm2 describe pde_version_upgrade > /dev/null 2>&1; then
                            echo "App already running — reloading with zero downtime..."
                            pm2 reload pde_version_upgrade --update-env
                        else
                            echo "First time start — launching PM2 cluster..."
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

    // ─────────────────────────────────────────
    // POST ACTIONS
    // ─────────────────────────────────────────
    post {
        success {
            echo "✅ BUILD #${BUILD_NUMBER} SUCCESS — http://10.10.120.190:9000/dashboard?id=PDE_UI"
        }
        failure {
            echo "❌ BUILD #${BUILD_NUMBER} FAILED — Check console output!"
        }
        always {
            cleanWs()
        }
    }
}
