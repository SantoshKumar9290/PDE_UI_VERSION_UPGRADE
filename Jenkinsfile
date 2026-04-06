pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://10.10.120.190:9000'
        SONAR_PROJECT_KEY = 'pde_version_upgrade'
        SONAR_TOKEN = credentials('sonar-token')   // Jenkins lo create cheyali
    }

    stages {

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
                sh 'npm run build || true'
            }
        }

        stage('Deploy with PM2') {
            steps {
                sh '''
                pm2 delete pde_app || true
                pm2 start npm --name "pde_app" -- start -i max
                pm2 save
                '''
            }
        }
    }
}
