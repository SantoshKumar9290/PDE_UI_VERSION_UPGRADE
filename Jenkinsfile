pipeline {
    agent any

    tools {
        nodejs "Node20"   // Jenkins lo configure chesina Node 20 tool name
    }

    environment {
        SONAR_HOST_URL = "http://10.10.120.190:9000"
        APP_NAME = "pde-ui-app"
    }

    stages {

        stage('Check Node Version') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

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

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                        sonar-scanner \
                        -Dsonar.projectKey=pde-ui \
                        -Dsonar.projectName=pde-ui \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build || true'
            }
        }

        stage('Deploy with PM2') {
            steps {
                sh """
                pm2 delete $APP_NAME || true
                pm2 serve build 3000 --name $APP_NAME --spa
                pm2 save
                """
            }
        }
    }

    post {
        success {
            echo "✅ Build + Sonar + PM2 Deployment SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED - Check Logs"
        }
    }
}
