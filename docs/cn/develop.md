---
id: develop
title: Octopus 开发指南
sidebar_label: Octopus 开发指南
---

## Build management of Octopus

Octopus借鉴了[Maven](https://maven.apache.org/)，并基于[make](https://www.gnu.org/software/make/manual/make.html)提供了一组项目构建管理工具。 生成管理过程包含多个阶段，一个阶段包含多个操作。 为了方便起见，动作的名称也代表当前阶段。 动作的总体流程关系如下所示：

```text
          generate -> mod -> lint -> build -> package -> deploy
                                         \ -> test -> verify -> e2e
```

每个动作的说明：

| Action | Usage |
|---:|:---|
| `generate`, `gen`, `g` | Generate deployment manifests and deepcopy/runtime.Object implementations of `octopus` via [`controller-gen`](https://github.com/kubernetes-sigs/controller-tools/blob/master/cmd/controller-gen/main.go); Generate proto files of `adaptor` interfaces via [`protoc`](https://github.com/protocolbuffers/protobuf). |
| `mod`, `m` | Download `octopus` dependencies. |
| `lint`, `l` | Verify `octopus` via [`golangci-lint`](https://github.com/golangci/golangci-lint), roll back to `go fmt` and `go vet` if the installation fails. <br/<br/> Use `DIRTY_CHECK=true` to verify the whole project is in dirty tree or not. |
| `build`, `b` | Compile `octopus` according to the type and architecture of the OS, generate the binary into `bin` directory. <br/><br/> Use `CROSS=true` to compile binaries of the supported platforms(search `constant.sh` file in this repo). |
| `test`, `t` | Run unit tests. |
| `verify`, `v` | Run integration tests with a Kubernetes cluster. <br/><br/> Use `CLUSTER_TYPE` to specify the type for local cluster, default is `k3d`. Instead of setting up a local cluster, you can also use environment variable `USE_EXISTING_CLUSTER=true` to point out an existing cluster, and then the integration tests will use the kubeconfig of the current environment to communicate with the existing cluster. |
| `package`, `pkg`, `p` | Package Docker image. |
| `e2e`, `e` | Run E2E tests. |
| `deploy`, `dep`, `d` | Push Docker images and create manifest images for the current version. <br/><br/> Use `WITHOUT_MANIFEST=true` to prevent pushing manifest image, or `ONLY_MANIFEST=true` to push the manifest images only and `IGNORE_MISSING=true` to warn on missing images defined in platform list if needed. |

执行一个阶段可以运行`make octopus <stage name>`，例如，在执行`test`阶段时，请运行`make octopus test`。 要执行一个阶段，将执行先前顺序中的所有动作，如果运行`make octopus test`，则实际上包括执行`generate`，`mod`，`lint`，`build`和`test`动作。

要通过添加`only`命令来运行某个动作，例如，如果仅运行`build`动作，请使用`make octopus build only`。

要组合多个动作，可以使用逗号列表，例如，如果要按顺序运行`build`，`package`和`deploy`动作，请使用`make octopus build，package，deploy`。

通过`BY`环境变量与[`dapper`](https://github.com/rancher/dapper)集成，例如，如果仅通过[`dapper`](https://github.com/rancher/dapper)运行`build`动作，请使用`BY=dapper make octopus build`。

### 使用案例

假设在Mac上尝试以下示例：

1.在本地主机上运行，当前环境将安装其他依赖项。 如果任何安装失败，您将收到相应的警告。
    - `make octopus build`：执行`build`阶段，然后获取`darwin/amd64` 的可执行二进制文件。
    - `make octopus test only`：在`darwin/amd64`平台上执行`test` 动作。
    - `REPO=somebody OS=linux ARCH=amd64 make octopus package`：执行`package` 动作，完成后可获取`linux/amd64` 的可执行二进制文件和一个Repo名为`somebody`的Octopus `linux/amd64` 的镜像。
    - `CLUSTER_TYPE=make octopus verify only`：使用[`kind`](https://github.com/kubernetes-sigs/kind)集群执行`verify`操作。

1. Support multi-arch in the localhost.
    - `CROSS=true make octopus build only`: execute `build` action, then get all execution binaries of supported platform.
    - `CROSS=true make octopus test only`: _crossed testing isn't supported currently_.
    - `CROSS=true REPO=somebody make octopus package only`: execute `package` action, then get all supported platform images of `somebody` repo.
        + `make octopus package only`: _packaging `darwin` platform image isn't supported currently_.
    - `CROSS=true REPO=somebody make octopus deploy only`: execute `deploy` action, then push all supported platform images to `somebody` repo, also create [manifest images](https://docs.docker.com/engine/reference/commandline/manifest/) for the current version.
        + `make octopus deploy only`: _deploying `darwin` platform image isn't supported currently_.
        
1. 在本地主机中支持多架构镜像。
    - `CROSS=true make octopus build only`: 执行`build` 操作，然后获取受支持平台的所有执行二进制文件。
    - `CROSS=true make octopus test only`: _目前不支持交叉平台测试_。
    - `CROSS=true REPO=somebody make octopus package only`: 执行`package` 操作，指定镜像的组织名为`somebody` 并构建所有支持的平台的镜像。 
        + `make octopus package only`: _当前不支持`darwin` 平台的镜像_.
    - `CROSS=true REPO=somebody make octopus deploy only`: 执行`deploy` 操作，然后将所有支持的平台的镜像推送至`somebody` 仓库，并且创建当前版本的[Manifest 文件](https://docs.docker.com/engine/reference/commandline/manifest/).
        + `make octopus deploy only`: _当前不支持`darwin` 平台镜像_.

1.在[`dapper`](https://github.com/rancher/dapper)模式下构建，当前环境中不需要其他依赖项，这类选项适合于构造CI/CD，并具有良好的环境可移植性。
   - `BY=dapper make octopus build`：执行`build` 阶段，然后获取`linux/amd64` 可执行二进制文件。
   - `BY=dapper make octopus test`：在`linux/amd64`平台上执行`test` 操作。
   - `BY=dapper REPO=somebody make octopus package only`：执行`package` 操作并获得`linux/amd64`架构和组织名为`sombody`的镜像。

### 注意事项

在[`dapper`](https://github.com/rancher/dapper)模式下：
- **不允许使用** `USE_EXISTING_CLUSTER=true`。

## 适配器的生成管理

适配器的构建管理与Octopus相似，但执行方式不同。 执行任何适配器的阶段都可以运行`make adapter <适配器名称> <阶段名称>`。 请查看[开发适配器](./adaptors/develop)了解更多详细信息。

## 所有组件的构建管理

随着组件的增加，一个接一个地构建它们的操作变得更加麻烦。 因此，通过指定阶段或动作，构建管理对所有组件执行相同的阶段或动作。 例如，运行`make all test`将执行Octopus和所有适配器的`test`阶段。 要执行一个动作，只需输入一个`only`后缀命令即可。

## 贡献者工作流程

欢迎进行贡献，请查看[CONTRIBUTING](https://github.com/cnrancher/octopus/blob/master/CONTRIBUTING.md)以获取更多详细信息。
