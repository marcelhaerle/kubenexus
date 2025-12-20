# KubeNexus

KubeNexus is a modern, web-based management console for Kubernetes clusters, built with Next.js and TypeScript. It is
designed specifically for lab environments and developers who need a quick, intuitive way to monitor and manage
their workloads without the overhead of heavy enterprise tools.

## Features (Roadmap)

- **Cluster Overview:** Real-time visualization of Namespaces, Pods, Deployments, and Services.
- **Resource Management:** Delete objects (Namespaces, Pods, etc.) directly from the UI.
- **Real-time Logs:** Stream Pod logs via WebSockets/SSE for instant debugging.
- **Web Terminal:** Execute commands within your cluster environment.
- **Manifest Management:** Upload and apply YAML manifests directly.
- **Mobile Friendly:** A responsive design built with Tailwind CSS.

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), Tailwind CSS, Shadcn UI
- **Backend:** Node.js (Next.js API Routes), WebSockets
- **Kubernetes Client:** `@kubernetes/client-node`
- **State Management:** TanStack Query (React Query)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- A running Kubernetes cluster (K3s, Minikube, or Bare Metal)
- Node.js 24+ installed
- A valid `~/.kube/config` or In-Cluster service account

### Installation

#### 1. Clone the [repository](https://github.com/marcelhaerle/kubenexus)

```bash
git clone https://github.com/marcelhaerle/kubenexus.git
cd kubenexus
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Run the development server

```bash
npm run dev
```

#### 4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
