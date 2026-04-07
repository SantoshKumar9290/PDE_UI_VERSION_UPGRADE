pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/SantoshKumar9290/PDE_UI_VERSION_UPGRADE.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=PDE_UI \
                      -Dsonar.sources=. \
                      -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('PM2 Deploy') {
            steps {
                sh '''
                pm2 delete pde-ui-app || true
                pm2 start ecosystem.config.js
                pm2 save
                '''
            }
        }
    }
}
