pipeline {
    agent any

    tools {
        nodejs "Node20"
    }

    environment {
        SONAR_HOST_URL = "http://10.10.120.20:9000"
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
                    npm install --legacy-peer-deps
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

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('Sonar-jenkins-token') {
                        withCredentials([string(credentialsId: 'jenkins-token', variable: 'SONAR_TOKEN')]) {

                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=pde_ui_upgrade \
                                -Dsonar.projectName="PDE UI Upgrade" \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.login=$SONAR_TOKEN
                            """
                        }
                    }
                }
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
            echo "SUCCESS: Build + SonarQube + Deployment Completed!"
        }
        failure {
            echo "FAILED: Check Jenkins logs!"
        }
    }
}
