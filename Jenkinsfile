pipeline {
    agent any

    environment {
        APP_NAME = "pde_app"
        APP_DIR = "/var/lib/jenkins/apps/pde_version_upgrade"
        SONAR_HOST_URL = "http://10.10.120.190:9000"
        SONAR_PROJECT_KEY = "pde_version_upgrade"
        SONAR_TOKEN = credentials('sonar-token')
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
                sh 'npm run build'
            }
        }

        stage('Deploy with PM2') {
            steps {
                sh '''
                echo "Deploying application..."

                # Create app directory
                mkdir -p $APP_DIR

                # Clean old deployment
                rm -rf $APP_DIR/*

                # Copy latest code
                cp -r * $APP_DIR/

                cd $APP_DIR

                # Install dependencies again (safe for fresh deploy)
                npm install

                # Build again inside deploy dir
                npm run build

                # Stop old app
                pm2 delete $APP_NAME || true

                # Start Next.js app in cluster mode on port 2000
                pm2 start npm --name "$APP_NAME" -- run deploy -i max

                # Save PM2 process
                pm2 save

                echo "Deployment completed successfully!"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build & Deployment SUCCESS'
        }
        failure {
            echo '❌ Build FAILED - Check logs'
        }
    }
}
