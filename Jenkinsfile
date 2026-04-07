pipeline {
agent any

```
environment {
    APP_NAME = "pde-ui-app"
}

tools {
    nodejs "Node20"
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
            sh '''
            npm install --legacy-peer-deps
            '''
        }
    }

    stage('Build Application') {
        steps {
            sh '''
            npm run build
            '''
        }
    }

    stage('SonarQube Analysis') {
        steps {
            withSonarQubeEnv('SonarQube') {
                sh 'sonar-scanner'
            }
        }
    }

    stage('Quality Gate') {
        steps {
            timeout(time: 5, unit: 'MINUTES') {
                waitForQualityGate abortPipeline: true
            }
        }
    }

    stage('Deploy with PM2 Cluster') {
        steps {
            sh '''
            pm2 delete pde-ui-app || true
            pm2 start ecosystem.config.js
            pm2 save
            '''
        }
    }
}

post {
    success {
        echo "SUCCESS"
    }
    failure {
        echo "FAILED"
    }
}
```

}
