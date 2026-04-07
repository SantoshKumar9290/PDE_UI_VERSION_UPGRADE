pipeline {
    agent any

    tools {
        nodejs "Node20"   // Make sure this exists in Jenkins
    }

    environment {
        APP_NAME = "pde_ui"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/SantoshKumar9290/PDE_UI_VERSION_UPGRADE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh """
                    rm -rf node_modules package-lock.json || true
                    npm install
                """
            }
        }

        stage('Clean Previous Build') {
            steps {
                sh "rm -rf .next || true"
            }
        }

        stage('Build Application') {
            steps {
                sh "npm run build"
            }
        }

        stage('Run Application (PM2)') {
            steps {
                sh """
                    npm install -g pm2 || true

                    pm2 delete ${APP_NAME} || true

                    pm2 start npm --name "${APP_NAME}" -- start

                    pm2 save
                """
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Build & Deployment Completed!"
        }
        failure {
            echo "FAILED: Check Jenkins logs!"
        }
    }
}
