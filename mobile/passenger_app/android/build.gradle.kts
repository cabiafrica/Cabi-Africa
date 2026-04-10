buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.3.2")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.10")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)

    afterEvaluate {
        configurations.all {
            resolutionStrategy {
                force("androidx.core:core-ktx:1.13.1")
                force("androidx.core:core:1.13.1")
                force("androidx.activity:activity:1.8.0")
                force("androidx.activity:activity-ktx:1.8.0")
                force("androidx.window:window-java:1.2.0")
                force("androidx.browser:browser:1.8.0")
                force("androidx.loader:loader:1.1.0")
            }
        }
        val android = project.extensions.findByName("android") as? com.android.build.gradle.BaseExtension
        android?.apply {
            compileOptions {
                sourceCompatibility = JavaVersion.VERSION_17
                targetCompatibility = JavaVersion.VERSION_17
            }
        }

        tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
            compilerOptions {
                jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
            }
        }

        if (pluginManager.hasPlugin("com.android.library")) {
            configure<com.android.build.gradle.LibraryExtension> {
                if (namespace == null) {
                    if (project.name == "flutter_jailbreak_detection") {
                        namespace = "appmire.be.flutterjailbreakdetection"
                    }
                }
            }
        }
    }
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
