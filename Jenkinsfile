pipeline {
    agent any

    environment {
        APP_NAME = "pde-ui-app"
    }

    tools {
        nodejs "Node20"
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
                sh 'npm install'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy with PM2 Cluster') {
            steps {
                sh '''
                echo "Stopping existing app..."
                pm2 delete pde-ui-app || true

                echo "Starting app in cluster mode..."
                pm2 start ecosystem.config.js

                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Build + Sonar + PM2 Deployment SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}
