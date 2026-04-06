pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    environment {
        SONAR_HOST_URL = "http://10.10.120.190:9000"
        SONAR_TOKEN = credentials('jenkins-token')
        APP_NAME = "pde-ui-app"
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

        stage('SonarQube Analysis') {
            steps {
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

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build UI') {
            steps {
                sh 'npm run build'
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
            echo "✅ UI Build + Sonar + PM2 SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}
