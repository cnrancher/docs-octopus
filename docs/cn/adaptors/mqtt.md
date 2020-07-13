---
id: mqtt
title: MQTT 适配器
---

## 注册信息

| 版本 | 注册名称 | 端点 Socket | 是否可用 |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/mqtt` | `mqtt.sock` | 是 |

## 支持模板

| 类型 | 设备组 | 版本 | 是否可用 | 
|:---|:---|:---|:---|
| `mqttDevice` | `devices.edge.cattle.io` | `v1alpha1` | 是 |

## 支持的平台

| 操作系统 | 架构 |
|:---|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## 使用方式

```shell script
kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/opcua/deploy/e2e/all_in_one.yaml
```

## 权限

对Octopus授予权限，如下所示：

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  mqttdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  mqttdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

### DeviceSpecProperty

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
name | 属性名称  | string | 是
description |  属性描述  | string | 否
jsonPath | 属性值的json路径，详情请参考[GJSON Syntax](https://github.com/tidwall/gjson/blob/master/SYNTAX.md)| string | 是
subInfo | 订阅信息adapter| [SubInfo](#subinfo) | 是
value | 属性的valueProps | [ValueProps](#valueprops) | 否

### DevicePropertyStatus

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
name | property name | string | 是
description | property describe | string | 否
value | valueProps of property | [ValueProps](#valueprops) | 否
updateAt | property status update time | string | 是

### MQTT参数

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
broker | MQTT broker url地址 | string  | 是
username | MQTT 用户名 | string | 是
password | MQTT 用户密码 | string | 是

### PubInfo

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
topic | topic名称  | string | 是
qos | MQTT服务质量等级 | int | 是
### SubInfo

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
topic | topic名称  | string | 是
payloadType |  MQTT payload 类型（json） | string | 是
qos | MQTT服务质量等级 | int | 是

### ValueProps

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
valueType | 属性类型，可选值包括：int、string、float、boolean、array和object | string | 否
intValue | int类型属性的值 | int | 否
stringValue | string类型属性的值 | string | 否
floatValue | float类型属性的值 | float | 否
booleanValue | boolean类型属性的值| boolean | 否
arrayValue | array类型属性的值 | RawExtension | 否
objectValue | object类型属性的值 | RawExtension | 否

## MQTT deviceLink YAML示例
```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: mqtt-test
spec:
  adaptor:
    node: k3d-k3s-default-server
    name: adaptors.edge.cattle.io/mqtt
    parameters:
      syncInterval: 5
      timeout: 10
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MqttDevice"
  template:
    metadata:
      labels:
        device: mqtt-test
    spec:
      config:
        broker: "tcp://192.168.8.246:1883"
        password: p*****3
        username: parchk
      properties:
        - name: "switch"
          description: "the room light switch"
          jsonPath: "switch"
          subInfo:
              topic: "device/room/light"
              payloadType: "json"
              qos: 2
        - name: "brightness"
          description: "the room light brightness"
          jsonPath: "brightness"
          subInfo:
              topic: "device/room/light"
              payloadType: "json"
              qos: 2
        - name: "power"
          description: "the room light power"
          jsonPath: "power"
          subInfo:
              topic: "device/room/light"
              payloadType: "json"
              qos: 2


```

### JSON Path语法

属性值的json路径，详情请参考[GJSON Syntax](https://github.com/tidwall/gjson/blob/master/SYNTAX.md)


### 快速入门

1. 更新上述[YAML](#example-of-mqtt-devicelink-yaml)文件示例中的MQTT broker参数配置
    ```yaml
        spec:
          config:
            broker: "tcp://192.168.8.246:1883"
            password: p*****3
            username: parchk
    ```
1. 启动`test/testdata/testdevice/roomlight`路径下的roomlight设备
    ```shell script
    cd ./testdata/testdevice/roomlight
    go build
    ./roomlight -b "tcp://192.168.8.246:1883"
    ```
   
1. 使用[roomlightcase1.yaml](../../deploy/e2e)部署DeviceLink
    ```shell script
    $ kubeclt apply -f roomlightcase1.yaml
    ```
1. 检查集群中设备的状态
    ```shell script
    $ kubeclt get mqttdevice mqtt-test -oyaml
    ```

1. 如果安装成功，应该返回如下信息：
    ```yaml
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MqttDevice"
    metadata: 
      creationTimestamp: 
      name: "testDevice"
    spec: 
      config: 
        broker: ""
        password: ""
        username: ""
      properties: 
      - description: "test property"
        jsonPath: "power"
        name: "test_property"
        pubInfo: 
          qos: "0"
          topic: ""
        subInfo: 
          payloadType: "json"
          qos: "2"
          topic: "test/abc"
        value: 
          valueType: ""
    status: 
      properties: 
      - description: "test property"
        name: "test_property"
        updateAt: "2020-05-20T09:04:46Z"
        value: 
          objectValue: 
            electricQuantity: "19.99"
            powerDissipation: "10KWH"
          valueType: "object"
    ```
1. 您可以修改设备属性，如下所示：

    ```shell script
    $ kubectl edit dl mqtt-test
    ```

    ```yaml
        spec:
          config:
            broker: tcp://192.168.8.246:1883
            password: p*****3
            username: parchk
          properties:
          - description: the room light switch
            jsonPath: switch
            name: switch
            subInfo:
              payloadType: json
              qos: 2
              topic: device/room/light
            value:
              stringValue: "on"
              valueType: string
    ```
