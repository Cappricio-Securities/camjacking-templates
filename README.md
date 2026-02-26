# CamJacking

CamJacking is a **security awareness training and simulation framework** designed to help organizations educate users about camera permission risks, browser security, and social engineering awareness in controlled, authorized environments.

<div align="center">

![Logo](https://github.com/Cappricio-Securities/camjacking-templates/blob/main/images/logo-final.png?raw=true)

![License](https://img.shields.io/badge/License-MIT-00ff41?style=for-the-badge)
![Node Version](https://img.shields.io/badge/Node.js-v18+-00ff41?style=for-the-badge&logo=node.js)
![Security Awareness](https://img.shields.io/badge/Security-Awareness-00ff41?style=for-the-badge)

</div>

---

## 🎯 What is CamJacking?

**CamJacking** is an enterprise-focused cybersecurity awareness framework built to simulate real-world camera permission prompts and user-consent scenarios in controlled lab environments.

It helps organizations:

- ✅ Educate users about camera and browser permission risks  
- ✅ Demonstrate how social engineering techniques work  
- ✅ Improve employee awareness through realistic simulations  
- ✅ Conduct authorized red-team / blue-team training  
- ✅ Measure user response and awareness levels  

> 🚨 **Important Notice**  
> CamJacking is strictly intended for:
>
> - Authorized security awareness training  
> - Internal lab environments  
> - Educational and research purposes  
> - Penetration testing with written authorization  
>
> Unauthorized use against individuals, systems, or organizations without explicit consent is illegal and unethical.

---

## 📌 Core Features

- 📸 **Camera Permission Awareness Simulation**  
  Demonstrates how camera access requests appear and how users should respond.

- 🖥️ **Admin Dashboard**  
  View training session logs, awareness results, and participation metrics.

- 📊 **Awareness Analytics**  
  Measure user behavior patterns during controlled simulations.

- 🔄 **Template-Based Simulation Framework**  
  Use multiple scenario templates to demonstrate different real-world cases.

- 🗂️ **Campaign Tracking**  
  Organize simulations into structured awareness campaigns.

---

## 📚 Templates System (Awareness Simulations)

CamJacking includes a **template-based system** that allows organizations to simulate various awareness scenarios in controlled environments.

### 🎨 What Are Templates?

Templates are pre-designed simulation interfaces that:

- Demonstrate permission prompts
- Simulate realistic UI patterns
- Help users recognize social engineering tactics
- Provide hands-on cybersecurity training

Templates are used **only inside authorized awareness campaigns**.

---

## 🧠 Why Templates Are Included

Templates serve an educational purpose:

- Teach employees how deceptive interfaces may appear  
- Train users to recognize permission abuse patterns  
- Strengthen human-layer security awareness  
- Provide practical cybersecurity education  

They are not designed for exploitation — they are designed for awareness and defense.

---

## 🚀 Accessing Templates

Templates can be selected directly from within the CamJacking CLI tool.

1. Launch CamJacking  
2. Select **Create New Target** (for a new awareness simulation)  
   OR  
3. Select **Existing Target**  
4. Choose the required awareness template  

The framework will automatically load the selected simulation interface in the authorized training environment.

---

## 🛠 Adding Custom Awareness Templates

Organizations can create custom templates for internal training programs.

### 📂 Required Folder Structure

Create your template in the following format:

```
template-name/
│── index.html
│── logo.png
```

### 📌 Naming Rules

- No spaces
- No special characters
- Allowed characters:
  - `A–Z`
  - `a–z`
  - `0–9`
  - `_` (underscore)
  - `-` (hyphen)

The `logo.png` file is used by the CamJacking Dashboard to visually represent your template.

---

### 📦 Moving Template to Templates Directory

After creating your template folder:

```bash
mv templatefolder ~/templates
```

> ⚠️ CamJacking must already be installed before performing this step.

Once added, restart the tool and your template will appear in the CLI selection menu.

---

## ⚠️ Compliance & Ethical Use

CamJacking must only be used when:

- You have written authorization  
- You are conducting internal awareness programs  
- You are operating in a controlled lab environment  
- You are performing approved security testing  

This project promotes:

- Responsible cybersecurity  
- Ethical hacking  
- Defensive security education  
- Human-layer risk awareness  

---

## 🎯 Our Mission

Our mission is to make **cybersecurity simple, accessible, and easy for everyone**.

We believe that while experienced professionals may prefer advanced tooling, awareness training should be:

- ✅ Easy to deploy  
- 🧭 Simple to navigate  
- 🔢 Menu-driven  
- 🖥️ Beginner-friendly  
- 🎓 Educational and practical  

We aim to bridge the gap between beginners and professionals by combining:

- The power of security simulation  
- The simplicity of modern interfaces  
- The responsibility of ethical cybersecurity  

> 💡 *“Cybersecurity should be powerful, but it should also be simple.”*

---

## 👨‍💻 Authors

**Karthi The Hacker**  
- 🌐 Website: https://karthithehacker.com  
- 🐙 GitHub: https://github.com/karthi-the-hacker  
- 🛠️ Contributions: Core CLI, backend logic, campaign framework  

**Akash K**  
- 🐙 GitHub: https://github.com/Ak4sh2523  
- 💼 LinkedIn: https://www.linkedin.com/in/akash-k-83223b224/  
- 🎨 Contributions: GUI/UI design, awareness templates, dashboard frontend  

---

<p align="center">
  <em>Built for responsible cybersecurity awareness training.</em><br/>
  <strong>Team Cappricio Securities</strong>
</p>
