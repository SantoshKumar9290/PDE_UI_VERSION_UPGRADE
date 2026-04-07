
👉 These should NOT be present at top or bottom.

---

# 🚀 ✅ CLEAN FINAL JENKINSFILE (NO BACKTICKS)

Copy this **exactly as-is** into your repo:

:::writing{variant="standard" id="jenk2"}
pipeline {
    agent any

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
                echo "Installing dependencies..."
                npm install --legacy-peer-deps
                '''
            }
        }

        stage('Build Application') {
            steps {
                sh '''
                echo "Building Next.js app..."
                npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    echo "Running SonarQube scan..."
                    sonar-scanner
                    '''
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
                echo "Stopping old app..."
                pm2 delete pde-ui-app || true

                echo "Starting app in cluster mode..."
                pm2 start ecosystem.config.js

                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Build + Sonar + PM2 Deployment SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}
:::

---

# 🔥 Summary

❌ Problem: Markdown backticks in Jenkinsfile  
✅ Fix: Remove ``` from file  
✅ Result: Pipeline will start correctly  

---

# 👉 Next Step

1. Edit Jenkinsfile in GitHub  
2. Remove ```  
3. Commit & push  
4. Run pipeline again  

---

If next error comes, send it 👍  
We’ll finish this completely 🚀
