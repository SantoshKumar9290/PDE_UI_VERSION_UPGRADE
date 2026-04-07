pipeline {
    agent any

    tools {
        nodejs "Node20"
    }

    environment {
        SONAR_HOST_URL = "http://10.10.120.20:9000"
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
                sh "npm install --force"
            }
        }

        stage('Clean Old Build') {
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
                withSonarQubeEnv('Sonar-jenkins-token') {
                    withCredentials([string(credentialsId: 'jenkins-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                            sonar-scanner \
                            -Dsonar.projectKey=pde_ui_upgrade \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Run Application (PM2)') {
            steps {
                sh """
                    npm install -g pm2 || true
                    pm2 delete pde_ui || true
                    pm2 start npm --name "pde_ui" -- start
                    pm2 save
                """
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Build + Sonar + App Running with PM2!"
        }
        failure {
            echo "FAILED: Check logs!"
        }
    }
}
