pipeline {
    agent any

    tools {
        nodejs 'Node20'              // ⚠️ must match Jenkins tool name
        sonarQubeScanner 'sonar-scanner'
    }

    environment {
        APP_NAME = "pde-ui-app"
        SONARQUBE_ENV = "SonarQube"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SantoshKumar9290/PDE_UI.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build || echo "No build step"'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh """
                    sonar-scanner \
                      -Dsonar.projectKey=PDE_UI \
                      -Dsonar.sources=. \
                      -Dsonar.login=$SONAR_AUTH_TOKEN
                    """
                }
            }
        }

        stage('Deploy with PM2 Cluster') {
            steps {
                sh '''
                pm2 delete ${APP_NAME} || true
                pm2 start ecosystem.config.js
                pm2 save
                '''
            }
        }
    }
}
