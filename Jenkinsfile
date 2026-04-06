pipeline {
    agent any

    environment {
        NODE_VERSION = "20"
        NVM_DIR = "$HOME/.nvm"
        SONAR_HOST_URL = "http://10.10.120.190:9000"
        SONAR_TOKEN = credentials('jenkins-token')
        APP_NAME = "pde-ui-app"
    }

    stages {

        stage('Install NVM & Node 20') {
            steps {
                sh '''
                # Install NVM if not exists
                if [ ! -d "$NVM_DIR" ]; then
                  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                fi

                source $NVM_DIR/nvm.sh

                # Remove old Node (optional safe cleanup)
                nvm uninstall 18 || true
                nvm uninstall 16 || true

                # Install Node 20
                nvm install $NODE_VERSION
                nvm use $NODE_VERSION
                nvm alias default $NODE_VERSION

                node -v
                npm -v
                '''
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
                sh '''
                source $NVM_DIR/nvm.sh
                nvm use 20
                npm install
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                source $NVM_DIR/nvm.sh
                nvm use 20

                sonar-scanner \
                -Dsonar.projectKey=pde-ui \
                -Dsonar.sources=. \
                -Dsonar.host.url=$SONAR_HOST_URL \
                -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                source $NVM_DIR/nvm.sh
                nvm use 20
                npm run build || true
                '''
            }
        }

        stage('Deploy with PM2') {
            steps {
                sh '''
                source $NVM_DIR/nvm.sh
                nvm use 20

                pm2 delete $APP_NAME || true
                pm2 serve build 3000 --name $APP_NAME --spa
                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Node 20 Installed + Build Success"
        }
        failure {
            echo "❌ Pipeline Failed"
        }
    }
}
