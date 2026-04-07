pipeline {
    agent any

    tools {
        nodejs 'Node20'   // must match Jenkins NodeJS tool name
    }

    environment {
        APP_NAME = "pde-ui-app"
        SONARQUBE_ENV = "SonarQube"
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

        stage('Build') {
            steps {
                sh 'npm run build || echo "No build step found"'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=PDE_UI \
                      -Dsonar.sources=. \
                      -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('PM2 Cluster Deploy') {
            steps {
                sh '''
                echo "Stopping old app if running..."
                pm2 delete ${APP_NAME} || true

                echo "Starting app in cluster mode..."
                pm2 start ecosystem.config.js

                echo "Saving PM2 process list..."
                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful!"
        }
        failure {
            echo "❌ Pipeline Failed!"
        }
    }
}
