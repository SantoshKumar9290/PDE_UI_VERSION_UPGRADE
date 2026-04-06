pipeline {
    agent any

    environment {
        // Fix npm/node path issue
        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"

        APP_NAME = "pde_app"
        APP_DIR = "/var/lib/jenkins/apps/pde_version_upgrade"

        SONAR_HOST_URL = "http://10.10.120.190:9000"
        SONAR_PROJECT_KEY = "pde_version_upgrade"
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Debug Node') {
            steps {
                sh '''
                echo "===== DEBUG INFO ====="
                echo "PATH=$PATH"
                which node || true
                which npm || true
                node -v || true
                npm -v || true
                '''
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/SantoshKumar9290/PDE_UI_VERSION_UPGRADE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Scan') {
            steps {
                sh '''
                sonar-scanner \
                -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                -Dsonar.sources=. \
                -Dsonar.host.url=$SONAR_HOST_URL \
                -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy with PM2') {
            steps {
                sh '''
                echo "===== DEPLOY START ====="

                mkdir -p $APP_DIR
                rm -rf $APP_DIR/*

                cp -r * $APP_DIR/

                cd $APP_DIR

                npm install
                npm run build

                pm2 delete $APP_NAME || true

                # Start Next.js app on port 2000 (cluster mode)
                pm2 start npm --name "$APP_NAME" -- run deploy -i max

                pm2 save

                echo "===== DEPLOY SUCCESS ====="
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build & Deployment SUCCESS'
        }
        failure {
            echo '❌ Build FAILED - Check logs'
        }
    }
}
