---
id: mqtt-extension
title: 适配器与MQTT集成
---

Octopus提供了两种的方法与[MQTT](http://mqtt.org/)集成：

1. [modbus](./modbus)、[opcua](./opc-ua)、[ble](./ble)和[dummy](./dummy)，都支持通过MQTT代理同步设备状态。 
1. 如果设备支持MQTT，则可以将[MQTT适配器](./mqtt)用作首选。

> 这篇文章主要概述了第一种方法的细节，如果您想了解更多关于MQTT适配器的信息，请查看[MQTT适配器](./mqtt)。 如果以上开箱即用的方式无法满足您的要求，则可以按照[CONTRIBUTING](../../CONTRIBUTING.md)提出您的想法，或[开发新的适配器](./develop.md)。

尽管MQTT的最新版本为v5.0，但目前Octopus暂时不支持该修订版，主要原因是[相应的开发库](https://www.eclipse.org/paho/clients/golang/)尚不支持[paho.mqtt.golang/issues＃347](https://github.com/eclipse/paho.mqtt.golang/issues/347)：

目前Octopus支持的MQTT版本如下： 

- [x] [MQTT 3.1](http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html)
- [x] [MQTT 3.1.1](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)

设备与MQTT集成后，可以显示设备状态、赋予设备使用MQTT的能力，或扩展设备的使用场景，例如设备交互和设备监视。

## MQTT

> MQTT是机器对机器（M2M）物联网连接协议。 它被设计为一种非常轻量级的消息传输协议。 对于与需要较小代码占用和网络带宽非常宝贵的远程位置的连接很有用。

尽管MQTT的名称包含`MQ`，但它不是用于定义消息队列的协议，实际上，[`MQ`是指IBM的MQseries产品，与`消息队列`无关。](https://www.hivemq.com/blog/mqtt-essentials-part2-publish-subscribe/#distinction-from-message-queues)。 
MQTT是一种轻量级的二进制协议，并且由于其最小的数据包开销，与HTTP之类的协议相比，MQTT在通过网络传输数据时表现出色。 MQTT提供了一种可以像消息队列一样发布和订阅的通信方式，同时，提供了许多功能来丰富通信场景，例如QoS，最后遗嘱和遗嘱，保留的消息等。 
要了解有关MQTT的更多信息，强烈推荐一系列文章：[MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)。

![mqtt-tcp-ip-stack](https://www.hivemq.com/img/blog/mqtt-tcp-ip-stack.png)

### 惯例

> **MQTT使用基于主题的消息过滤**。 **每封邮件都包含一个主题(主题)**，代理可以使用该主题来确定订阅客户端是否收到该邮件。

在MQTT中，**topic**是可用于[过滤和路由消息](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/)的层次结构字符串， 而**payload**数据不可知，这意味着发布者可以发送二进制数据，文本数据甚至是 完整的XML或JSON，因此设计主题树和有效负载架构是任何MQTT部署的重要工作。

Octopus遵循[MQTT Essentials中MQTT主题的最佳实践](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/#best-practices)来构造 **topic**名称，并将 **payload** 数据编组为JSON。

## 配置选项

Octopus重新组织了[github.com/eclipse/paho.mqtt.golang](https://github.com/eclipse/paho.mqtt.golang/blob/4c98a2381d16c21ed2f9f131cec2429b0348ab0f/options.go#L53-L87)的客户端参数 然后构造以下配置选项。 配置选项的可用版本为`v1alpha1`。

|  版本 | 是否可用| 最新版 |
|:---:|:---:|:---:|
|  [`v1alpha1`](./integrate_with_mqtt.md) | 是 | 是 |

当前的官方适配器（如BLE，Modbus和OPC-UA）使用相同的配置（请参阅以下`spec.template.spec.extension`）支持MQTT协议扩展。

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
 name: living-room-fan
spec:
 adaptor:
   node: edge-worker
   name: adaptors.edge.cattle.io/dummy
 model:
   apiVersion: "devices.edge.cattle.io/v1alpha1"
   kind: "DummySpecialDevice"
 template:
   metadata:
     labels:
       device: living-room-fan
   spec:
     extension:
       mqtt:
         client:
           server: tcp://test.mosquitto.org:1883
           maxReconnectInterval: 20s
         message:
           topic:
             prefix: cattle.io/octopus
           qos: 1
     protocol:
       location: "living_room"
     gear: slow
     "on": true
```

### 规范

MQTT选项的规范在所有MQTT扩展适配器中均有效，它们用于连接MQTT代理，指导连接，指示要发布/订阅的主题以及有效载payload的编码。

#### DeviceExtensionSpec

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| mqtt | mqtt配置说明 | [MQTTOptionsSpec](#mqttoptionsspec) | 否 |

#### MQTTOptionsSpec

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| client | 客户端配置 | [MQTTClientOptions](#mqttclientoptions) | 是 |
| message | 信息配置 | [MQTTMessageOptions](#mqttmessageoptions) | 是 |

#### MQTTClientOptions

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| server | MQTT broker的server URI，应该遵循`schema://host:port`格式，`schema`的可选值包括：ws、wss、tcp、unix、ssl、tls、和tcps。 | string | 是 |
| protocolVersion | MQTT的版本号，可选值为：3或4；3表示使用的MQTT版本号为 3.1，4表示使用的MQTT版本号为 3.1.1。 | uint | 否 |
| will | Specifies the last will message that the client gives it to the broker. | [MQTTClientWillMessage](#mqttclientwillmessage) | 否 |
| basicAuth | 客户端连接broker时使用的校验信息，包括用户名和密码。 | [MQTTClientBasicAuth](#mqttclientbasicauth) | 否 |
| tlsConfig | 客户端连接broker时使用的TLS配置信息 | [MQTTClientTLS](#mqttclienttls)  | 否 |
| cleanSession | 是否与MQTT broker 建立持久会话，默认值为`true` | bool  | 否 |
| store | 当QoS等级是1或2时，存储消息的位置默认值是`memory` | [MQTTClientStore](#mqttclientstore)  | 否 |
| resumeSubs | 连接时，是否启用存储未订阅消息的功能，默认值为`false`，当`CleanSession`的值为`false`时有效| bool | 否 |
| connectTimeout | 连接超时的时长，默认值为`30s` | string  | 否 |
| keepAlive | 客户端向broker发送Ping请求之前的等待时间，默认值是`10s` | string | 否 |
| pingTimeout | 客户端向broker发送Ping请求后，等待broker返回信息的时间，默认值是`10s` | string | 否 |
| order | 是否将信息路由到每个QoS等级排序，默认值为true| bool | 否 |
| writeTimeout | 客户端成功发布信息的等待时长，如果超过这个时间还没有发布成功，则表示超时，返回超时错误信息，默认值为`30s`| string  | 否 |
| autoReconnect | 是否自动重新连接默认值是`true` | bool  | 否 |
| maxReconnectInterval | 自动重新连接之前的等待时长，默认值是`10m` | string  | 否 |
| messageChannelDepth | 客户端无法连接时，存储信息的内部队列大小，默认值是`100` | uint  | 否 |
| httpHeaders | 指定客户端在 WebSocket 开启握手时发送的附加 HTTP 消息头 | string  | 否 |


#### MQTTClientWillMessage

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| topic | 指定发布最后一条遗嘱信息的主题，如果没有设置，遗嘱主题将在全局设置中指定的主题名称后附加"$will "作为其主题名称。 | string  | 否 |
| payloadEncode| 定义发布消息的编码方式，可选值： "raw "和 "base64"，默认值为raw。 | string | 否 |
| payloadContent | 指定payload的内容 | string | 否 |
| qos | 消息的QoS等级，可选值为0、1、2，0表示最多发送一次，1表示最少发送一次，2表示只发送一次，默认值为`0`。 | byte | 否 |
| retained | 是否要保留的信息，默认值为 "false"。 | bool | 否 |

#### MQTTClientBasicAuth

|参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| name | MQTT服务器用户名 | string  | 否 |
| password | MQTT服务器用户密码 | string  | 否 |

#### MQTTClientTLS

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| caFilePem |  CA证书的PEM格式内容，用于验证服务器证书 | string  | 否 |
| caFilePemRef | 指定DeviceLink的引用关系，以引用值作为CA文件的PEM内容 | [DeviceLinkReferenceRelationship](#devicelinkreferencerelationship)  | 否 |
| certFilePem | 证书的PEM格式内容，用于客户端对服务器的认证。 | string  | 是 |
| certFilePemRef | 指定DeviceLink的引用关系，以引用值作为客户端证书文件的PEM内容。 | [DeviceLinkReferenceRelationship](#devicelinkreferencerelationship)  | 否 |
| keyFilePem | 密钥的PEM格式内容，用于客户端对服务器的认证。 | string  | 是 |
| keyFilePemRef | 指定DeviceLink的引用关系，将该值作为客户端密钥文件PEM内容引用。| [DeviceLinkReferenceRelationship](#devicelinkreferencerelationship)  | 是 |
| serverName| 服务器的名称，参见 http://tools.ietf.org/html/rfc4366#section-3.1  | string  | 否 |
| insecureSkipVerify | 是否不验证服务器证书，默认值是 `false` | bool  | 否 |

#### DeviceLinkReferenceRelationship

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| name | 指定引用的k8s资源名(目前只支持k8s secret和configmap在同一命名空间内) | string | 是 |
| item | 指定参考文献的项目名称 | string | 是 |

#### MQTTClientStore

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| type | 指定存储类型。选项为 "memory "和 "file"，默认值为 "memory"| string | 否 |
| direcotryPrefix | 如果使用文件存储，则指定存储的目录前缀，默认值是`/var/run/octopus/mqtt`。默认值是`/var/run/octopus/mqtt` | string | 否 |

#### MQTTMessageOptions

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| topic | 指定topic的设置。 | [MQTTMessageTopic](#mqttmessagetopic) | 是 |
| payloadEncode | 定义发布消息的编码方式，选项有 "raw "和 "base64"，默认为raw。 | string | 否 |
| qos | 消息的QoS等级，可选值为0、1、2，0表示最多发送一次，1表示最少发送一次，2表示只发送一次，默认值为`0` | byte | 否 |
| retained | 指定要保留的信息，默认值为 "false"。 | bool | 否 |
| waitTimeout | 指定客户端操作后应等待的时间，默认值为`0s`，即永不超时。 | string | 否 |

#### MQTTMessageTopic

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| name | 指定主题的静态名称，如果同时配置了 "name "和 "prefix"，则默认使用该静态名称 | string | 否 |
| prefix | 指定主题的动态名称的前缀。动态名称需要前缀。| string | 否 |
| with | 指定主题的动态名称的模式。选项有`nn`(k8s name + namespace)和`uid`(k8s resource uid)，默认模式为`nn` | string | 否 |


### YAML配置文件示例

MQTT选项的规范在所有MQTT扩展适配器中均有效，它们用于连接MQTT代理服务器，引导连接，指示要发布/订阅的主题以及有效Payload的编码等。REQUIRED是必填字段。

```yaml

# Specifies the client settings.
client:

  # Specifies the server URI of MQTT broker, the format should be `schema://host:port`.
  # The "schema" is one of the "ws", "wss", "tcp", "unix", "ssl", "tls" or "tcps".
  # REQUIRED
  server: <string>
  
  # Specifies the MQTT protocol version that the cluster uses to connect to broker.
  # Legitimate values are currently 3 - MQTT 3.1 or 4 - MQTT 3.1.1.
  protocolVersion: <int, 3|4>
  
  # Specifies the will message that the client gives it to the broker,
  # which can be published to any clients that are subscribed the provided topic.
  will:
  
    # Specifies the topic for publishing the will message,
    # if not set, the will topic will append "$will" to the topic name specified
    # in global settings as its topic name.
    topic: 
      
      # Specifies the static name of topic.
      name: <string>
  
    # Specifies the encode way of payload content.
    #   raw: Not encode.
    #   base64: The output (published) data is encoded with Base64, and the input (subscribed) data is decoded with Base64. 
    # The "base64" way allows to input bytes (`payloadContent`) that cannot be characterized.
    # The default way is "raw".
    payloadEncode: <string, raw|base64>

    # Specifies the payload content.
    # REQUIRED
    payloadContent: <string>
  
    # Specifies the QoS of the will message.
    #   0: Send at most once.
    #   1: Send at least once.
    #   2: Send exactly once.
    # The default value is "0".
    qos: <int, 0|1|2>
  
    # Specifies the will message to be retained.
    # The default value is "false".
    retained: <bool>
  
  # Specifies the username and password that the client connects
  # to the MQTT broker. Without the use of `tlsConfig`,
  # the account information will be sent in plaintext across the wire.
  basicAuth:
    name: <string>
    passsword: <string>
  
  # Specifies the TLS configuration that the client connects to the MQTT broker.
  tlsConfig:
    
    # The PEM format content of the CA certificate,
    # which is used for validate the server certificate with.
    caFilePem: <string>
    
    # The PEM format content of the certificate and key,
    # which is used for client authenticate to the server.
    certFilePem: <string>
    keyFilePem: <string>
    
    # Indicates the name of the server, ref to http://tools.ietf.org/html/rfc4366#section-3.1.
    serverName: <string>
  
    # Doesn't validate the server certificate.
    insecureSkipVerify: <bool>

  # Specifies setting the "clean session" flag in the connect message that the MQTT broker should not
  # save it. Any messages that were going to be sent by this client before disconnecting previously but didn't send upon connecting to the broker.
  # The default value is "true".
  cleanSession: <bool>
  
  # Specifies to provide message persistence in cases where QoS level is 1 or 2.
  # The default store is "memory".
  store: 
    
    # Specifies the type of storage.
    # The default store is "memory".
    type: <string, memory|file>
    
    # Specifies the directory prefix of the storage, if using file store.
    # The default value is "/var/run/octopus/mqtt".
    direcotryPrefix: <string>

  # Specifies to enable resuming of stored (un)subscribe messages when connecting but not reconnecting.
  # This is only valid if `cleanSession` is false.
  # The default value is "false".
  resumeSubs: <bool>

  # Specifies the amount of time that the client try to open a connection
  # to an MQTT broker before timing out and getting error.
  # A duration of 0 never times out.
  # The default value is "30s".
  connectionTime: <string>

  # Specifies the amount of time that the client should wait
  # before sending a PING request to the broker. This will
  # allow the client to know that the connection has not been lost
  # with the server.
  # A duration of 0 never keeps alive.
  # The default keep alive is "30s".
  keepAlive: <string>

  # Specifies the amount of time that the client should wait
  # after sending a PING request to the broker. This will
  # allow the client to know that the connection has been lost
  # with the server.
  # A duration of 0 may cause unnecessary timeout error.
  # The default value is "10s".
  pingTimeout: <string>
  
  # Specifies the message routing to guarantee order within each QoS level. If set to false,
  # the message can be delivered asynchronously from the client to the application and
  # possibly arrive out of order.
  # The default value is "true".
  order: <bool>
  
  # Specifies the amount of time that the client publish a message successfully before
  # getting a timeout error.
  # A duration of 0 never times out.
  # The default value is "30s".
  writeTimeout: <string>
  
  # Configures using the automatic reconnection logic.
  # The default value is "true".
  autoReconnect: <bool>
  
  # Specifies the amount of time that the client should wait
  # before reconnecting to the broker. The first reconnect interval is 1 second,
  # and then the interval is incremented by *2 until `MaxReconnectInterval` is reached.
  # This is only valid if `AutoReconnect` is true.
  # A duration of 0 may trigger the reconnection immediately.
  # The default value is "10m".
  maxReconnectInterval: <string>

  # Specifies the size of the internal queue that holds messages
  # while the client is temporarily offline, allowing the application to publish
  # when the client is reconnected.
  # This is only valid if `autoReconnect` is true.
  # The default value is "100".
  messageChannelDepth: <int>
  
  # Specifies the additional HTTP headers that the client sends in the WebSocket opening handshake.
  httpHeaders: <map[string][]string>

# Specifies the message settings.
message:
    
  # Specifies the topic settings.
  # REQUIRED
  topic:
      
    # Specifies the static name of topic.
    name: <string>
      
    # Specifies the prefix for the dynamic name of topic.
    # The prefix is REQUIRED for dynamic name.
    prefix: <string>
      
    # Specifies the mode for the dynamic name of topic.
    # The default mode is "nn".
    with: <string, nn|uid>

  # Specifies the encode way of payload data.
  #   raw: Not encode.
  #   base64: The output (published) data is encoded with Base64, and the input (subscribed) data is decoded with Base64.
  # The default way is "raw".
  payloadEncode: <string, raw|base64>

  # Specifies the QoS of the will message.
  #   0: Send at most once.
  #   1: Send at least once.
  #   2: Send exactly once.
  # The default value is "0".
  qos: <int, 0|1|2>

  # Specifies the will message to be retained.
  # The default value is "false".
  retained: <bool>

  # Specifies the amount of time that the client should wait after operating.
  # A duration of 0 never times out.
  # The default value is "0s".
  waitTimeout: <string>

```

### MQTT选项状态

MQTT选项的状态在所有MQTT扩展适配器中也是有效的，它们描述了MQTT配置的实际状态。

```yaml

# Observes the client settings.
client:

  # Observes the broker server URI.
  server: <string>
  
  # Observes the protocol version.
  protocolVersion: <int>

  # Observes the will message that the client gives it to the broker.
  will:

    # Observes the topic for publishing the will message.
    topicName: <string>
    
    # Observes the encode way of payload content.
    payloadEncode: <string>

    # Observes the QoS of the will message.
    qos: <int>

    # Observes if retaining the will message.
    retained: <bool>

  # Observes if configuring basic authentication.
  configBasicAuth: <bool>

  # Observes if configuring TLS.
  configTLS: <bool>
  
  # Observes if setting the "clean session" flag.
  cleanSession: <bool>

  # Observes the store type.
  store:

     # Observes the type of storage.
     type: <string>
     
     # Observes the directory of the file storage.
     directory: <string>
  
  # Observes if enabling resuming of stored (un)subscribe messages when connecting but not reconnecting.
  resumeSubs: <bool>

  # Observes the amount of time that the client try to open a connection
  # to an MQTT broker before timing out and getting error.
  connectTimeout: <string>

  # Observes the amount of time that the client should wait
  # before sending a PING request to the broker.
  keepAlive: <string>
  
  # Observes the amount of time that the client should wait
  # after sending a PING request to the broker.
  pingTimeout: <string>
  
  # Observes the message routing to guarantee order within each QoS level.
  order: <bool>

  # Observes the amount of time that the client publish a message successfully before getting a timeout error.
  writeTimeout: <string>
  
  # Observes if using the automatic reconnection logic.
  autoReconnect: <bool>
  
  # Observes the amount of time that the client should wait before reconnecting to the broker.
  maxReconnectInterval: <int>

  # Observes the size of the internal queue that holds messages while the client is temporarily offline, 
  # allowing the application to publish when the client is reconnected.
  messageChannelDepth: <int>
  
  # Observes the additional HTTP headers that the client sends in the WebSocket opening handshake.
  httpHeaders: <map[string][]string>
 
# Observes the message settings. 
message:
  
  # Observes the topic for publishing/subscribing the message.
  topicName: <string>
  
  # Observes the encode way of payload content.
  payloadEncode: <string>

  # Observes the QoS of the message.
  qos: <int>
  
  # Observes if retaining the message.
  retained: <bool>
  
  # Observes the amount of time that the client should wait after operating.
  waitTimeout: <string>

```



