---
id: mqtt-extension
title: Integrate with MQTT
---

Octopus provides two out-of-box ways to integrate with [MQTT](http://mqtt.org/):

1. Most Octopus adaptors, like [BLE adaptor](./ble.md) support to synchronize the device status via an MQTT broker. Get more MQTT extension adaptors [below](#supported-adaptors).
1. If the device naturally supports MQTT, the [MQTT adaptor](./mqtt.md) can be used as the first choice.

> This post mainly outlines the detail of the first way, if you want to know more about the MQTT adaptor, please view [here](./mqtt). If the above out-of-box ways cannot satisfy you, you can follow the [CONTRIBUTING](https://github.com/cnrancher/octopus/blob/master/CONTRIBUTING.md) to contribute your idea or [develop a new adaptor](./develop.md).

Although the latest version of MQTT is v5.0, for the time being, Octopus does not support the revision, the main reason is the [corresponding development library](https://www.eclipse.org/paho/clients/golang/) does not support yet([paho.mqtt.golang/issues#347](https://github.com/eclipse/paho.mqtt.golang/issues/347)):

- [x] [MQTT 3.1](http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html)
- [x] [MQTT 3.1.1](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [ ] [MQTT 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)

Integrating with MQTT to expose the status of a device, in addition to giving the device an ability to use MQTT, can also expand the usage scenarios of the device, such as equipment interaction and equipment monitoring.

## MQTT

> MQTT is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol. It was designed as an extremely lightweight publish/subscribe messaging transport. It is useful for connections with remote locations where a small code footprint is required and/or network bandwidth is at a premium.

Although MQTT's name contains "MQ", it is not a protocol for defining a message queue, actually, [the "MQ" refers to the MQseries product from IBM and has nothing to do with "Message Queue"](https://www.hivemq.com/blog/mqtt-essentials-part2-publish-subscribe/#distinction-from-message-queues). MQTT is a lightweight and binary protocol, and due to its minimal packet overhead, MQTT excels when transferring data over the wire in comparison to protocols like HTTP. MQTT provides a means of communication that can be pub/sub like a message queue, at the same time, many features are provided to enrich communication scenarios, such as QoS, Last will and testament, retained message and so on. To learn more about MQTT, there are a series of articles that are highly recommended: [MQTT Essentials](https://www.hivemq.com/mqtt-essentials/).

![mqtt-tcp-ip-stack](https://www.hivemq.com/img/blog/mqtt-tcp-ip-stack.png)

### Convention

> **MQTT uses subject-based filtering of messages**. **Every message contains a topic (subject)** that the broker can use to determine whether a subscribing client gets the message or not. 

In MQTT, the **topic** is a hierarchically-structured string that can be used to [filter and route messages](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/) and the **payload** data is agnostic which means the publisher can send binary data, text data, or even full-fledged XML or JSON, so designing the topic tree and payload schema is an important work of any MQTT deployment.

Octopus recommends you to construct the **topic** name followed the [best practices of MQTT topic from MQTT Essentials](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/#best-practices), and marshals the **payload** data as JSON.

## Configuration

Octopus reorganizes the client parameters of [github.com/eclipse/paho.mqtt.golang](https://github.com/eclipse/paho.mqtt.golang/blob/4c98a2381d16c21ed2f9f131cec2429b0348ab0f/options.go#L53-L87), and then provides a set of configuration options.

The current official Adaptors such as [BLE](./ble.md), [Modbus](./modbus.md) and [OPC-UA](./opcua.md) support the MQTT protocol extension using the same configuration (refer to the following `spec.template.spec.extension.mqtt`).

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
           topic: cattle.io/octopus/:namespace/:name
           qos: 1
     protocol:
       location: "living_room"
     gear: slow
     "on": true
```

### Specification

The specification of MQTT options are valid in all MQTT extension adaptors, they are using for connecting the MQTT broker, guiding the connection, indicating which topic to publish/subscribe and encoding of payload data.

#### MQTTOptions

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| client | Specifies the client settings. | [MQTTClientOptions](#mqttclientoptions) | true |
| message | Specifies the message settings. | [MQTTMessageOptions](#mqttmessageoptions) | true |

##### MQTTClientOptions

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| server | Specifies the server URI of MQTT broker, the format should be `schema://host:port`. The `schema` is one of the "ws", "wss", "tcp", "unix", "ssl", "tls" or "tcps". | string | true |
| protocolVersion | Specifies the MQTT protocol version that the cluster uses to connect to broker. Legitimate values are `3` - MQTT 3.1 and `4` - MQTT 3.1.1, The default value is `0`, which means MQTT v3.1.1 identification is preferred. | *uint | false |
| basicAuth | Specifies the username and password that the client connects to the MQTT broker. | *[MQTTClientBasicAuth](#mqttclientbasicauth) | false |
| tlsConfig | Specifies the TLS configuration that the client connects to the MQTT broker. | *[MQTTClientTLS](#mqttclienttls)  | false |
| cleanSession | Specifies setting the "clean session" flag in the connect message that the MQTT broker should not, default to `true`. | *bool  | false |
| store | Specifies to provide message persistence in cases where QoS level is 1 or 2, the default store is `Memory`. | *[MQTTClientStore](#mqttclientstore)  | false |
| resumeSubs | Specifies to enable resuming of stored (un)subscribe messages when connecting but not reconnecting. This is only valid if `cleanSession` is `false`. The default value is `false`. | *bool | false |
| connectTimeout | Specifies the amount of time that the client try to open a connection to an MQTT broker before timing out and getting error. A duration of 0 never times out. The default value is `30s`. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27)  | false |
| keepAlive | Specifies the amount of time that the client should wait before sending a PING request to the broker. The default keep alive is `10s`. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27) | false |
| pingTimeout | Specifies the amount of time that the client should wait after sending a PING request to the brokerThe default value is `10s`. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27) | false |
| order | Specifies the message routing to guarantee order within each QoS level. The default value is `true`. | *bool | false |
| writeTimeout | Specifies the amount of time that the client publish a message successfully before getting a timeout error, default to `30s`. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27)  | false |
| waitTimeout | Specifies the amount of time that the client should timeout after subscribed/published a message, a duration of `0` never times out. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27)  | false |
| disconnectQuiesce | Specifies the quiesce when the client disconnects, default to `5s`. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27)  | false |
| autoReconnect | Configures using the automatic reconnection logic, default to `true`. | *bool | false |
| maxReconnectInterval | Specifies the amount of time that the client should wait before reconnecting to the broker, default to `10m`. | *[metav1.Duration](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/duration.go#L27)  | false |
| messageChannelDepth | Specifies the size of the internal queue that holds messages while the client is temporarily offline, default to `100`. | *uint  | false |
| httpHeaders | Specifies the additional HTTP headers that the client sends in the WebSocket opening handshake. | map[string][]string | false |

##### MQTTClientBasicAuth

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| username | Specifies the username for basic authentication. | string  | false |
| usernameRef | Specifies the relationship of DeviceLink's references to refer to the value as the username. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false |
| password | Specifies the password for basic authentication. | string  | false |
| passwordRef | Specifies the relationship of DeviceLink's references to refer to the value as the password. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false |

##### MQTTClientTLS

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| caFilePEM |  The PEM format content of the CA certificate, which is used for validate the server certificate with. | string  | false |
| caFilePEMRef | Specifies the relationship of DeviceLink's references to refer to the value as the CA file PEM content . | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12)  | false |
| certFilePEM | The PEM format content of the certificate, which is used for client authenticate to the server. | string  | false |
| certFilePEMRef | Specifies the relationship of DeviceLink's references to refer to the value as the client certificate file PEM content . | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false |
| keyFilePEM | The PEM format content of the key, which is used for client authenticate to the server. | string  | false |
| keyFilePEMRef | Specifies the relationship of DeviceLink's references to refer to the value as the client key file PEM content. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false |
| serverName| Indicates the name of the server, ref to http://tools.ietf.org/html/rfc4366#section-3.1  | string  | false |
| insecureSkipVerify | Doesn't validate the server certificate, default value is `false`. | bool  | false |

##### MQTTClientStore

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| type | Specifies the type of storage. Options are `Memory` and `File`, the default value is `Memory`. | string | false |
| direcotryPrefix | Specifies the directory prefix of the storage, if using `File` store. The default value is `/var/run/octopus/mqtt`. | string | false |

#### MQTTMessageOptions

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| topic | Specifies the topic. | string | true |
| will | Specifies the will message. | *[MQTTWillMessage](#mqttwillmessage) | false |
| qos | Specifies the QoS of the message, default value is `1`. | *[MQTTMessageQoSLevel](#mqttmessageqoslevel) | false |
| retained | Specifies if the last published message to be retained, default is `true`. | *bool | false |
| path | Specifies the path for rendering the `:path` keyword of topic. | string | false |
| operator | Specifies the operator for rendering the `:operator` keyword of topic. | *[MQTTMessageTopicOperator](#mqttmessagetopicoperator) | false |

##### MQTTWillMessage

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| topic | Specifies the topic of will message. If not set, the topic will append `$will` to the topic name specified in parent field as its topic name. | string | false |
| content | Specifies the content of will message. The serialized form of the content is a Base64 encoded string, representing the arbitrary (possibly non-string) content value here. | string | true |

##### MQTTMessageQoSLevel

Parameter | Description | Scheme
--- | --- | ---
0 | Send at most once. | byte 
1 | Send at least once. | byte  
2 | Send exactly once. | byte 

##### MQTTMessageTopicOperator

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| read | Specifies the operator for rendering the `:operator` keyword of topic during subscribing. | string | false |
| write | Specifies the operator for rendering the `:operator` keyword of topic during publishing. | string | false |

### YAML

The specification of MQTT options are valid in all MQTT extension adaptors, they are using for connecting the MQTT broker server, guiding the connection, indicating which topic to publish/subscribe and encoding of payload data and so on.

> REQUIRED is the required field to be filled.

```yaml

# Specifies the client settings.
client:

  # Specifies the server URI of MQTT broker, the format should be `schema://host:port`.
  # The "schema" is one of the "ws", "wss", "tcp", "unix", "ssl", "tls" or "tcps".
  # REQUIRED
  server: <string>
  
  # Specifies the MQTT protocol version that the cluster uses to connect to broker.
  # Legitimate values are currently 3 - MQTT 3.1 or 4 - MQTT 3.1.1.
  # The default value is 0, which means MQTT v3.1.1 identification is preferred.
  protocolVersion: <int, 0|3|4>
  
  # Specifies the username and password that the client connects
  # to the MQTT broker. Without the use of `tlsConfig`,
  # the account information will be sent in plaintext across the wire.
  basicAuth:
    # Specifies the username for basic authentication.
    username: <string>

    # Specifies the relationship of DeviceLink's references to
    # refer to the value as the username.
    usernameRef:

      # Specifies the name of reference.
      # REQUIRED
      name: <string>

      # Specifies the item name of the referred reference.
      # REQUIRED
      item: <string>

    # Specifies the relationship of DeviceLink's references to refer to the value as the username.
    passsword: <string>

    # Specifies the relationship of DeviceLink's references to
    # refer to the value as the password.
    passwordRef:

      # Specifies the name of reference.
      # REQUIRED
      name: <string>

      # Specifies the item name of the referred reference.
      # REQUIRED
      item: <string>
  
  # Specifies the TLS configuration that the client connects to the MQTT broker.
  tlsConfig:
    
    # The PEM format content of the CA certificate,
    # which is used for validate the server certificate with.
    caFilePEM: <string>

    # Specifies the relationship of DeviceLink's references to
    # refer to the value as the CA file PEM content.
    caFilePEMRef:

      # Specifies the name of reference.
      # REQUIRED
      name: <string>

      # Specifies the item name of the referred reference.
      # REQUIRED
      item: <string>
    
    # The PEM format content of the certificate and key,
    # which is used for client authenticate to the server.
    certFilePEM: <string>

    # Specifies the relationship of DeviceLink's references to
    # refer to the value as the client certificate file PEM content.
    certFilePEMRef:

      # Specifies the name of reference.
      # REQUIRED
      name: <string>

      # Specifies the item name of the referred reference.
      # REQUIRED
      item: <string>

    # Specifies the PEM format content of the key(private key),
    # which is used for client authenticate to the server.
    keyFilePEM: <string>

    # Specifies the relationship of DeviceLink's references to
    # refer to the value as the client key file PEM content.
    keyFilePEMRef:

      # Specifies the name of reference.
      # REQUIRED
      name: <string>

      # Specifies the item name of the referred reference.
      # REQUIRED
      item: <string>

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
    # The default store is "Memory".
    type: <string, Memory|File>
    
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

  # Specifies the amount of time that the client should timeout
  # after subscribed/published a message.
  # A duration of 0 never times out.
  waitTimeout: <string>

  # Specifies the quiesce when the client disconnects.
  # The default value is "5s".
  disconnectQuiesce: <string>
  
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
    
  # Specifies the topic.
  # REQUIRED
  topic: <string>

  # Specifies the will message that the client gives it to the broker,
  # which can be published to any clients that are subscribed the provided topic.
  will:
  
    # Specifies the topic of will message.
    # if not set, the topic will append "$will" to the topic name specified
    # in parent field as its topic name.
    topic: <string>
    
    # Specifies the content of will message. The serialized form of the content is a
    # base64 encoded string, representing the arbitrary (possibly non-string) content value here.
    content: <string, base64-encoded>

  # Specifies the QoS of the will message.
  #   0: Send at most once.
  #   1: Send at least once.
  #   2: Send exactly once.
  # The default value is "1".
  qos: <int, 0|1|2>

  # Specifies the will message to be retained.
  # The default value is "true".
  retained: <bool>

  # Specifies the path for rendering the `:path` keyword of topic.
  path: <string>

  # Specifies the operator for rendering the `:operator` keyword of topic.
  operator:

    # Specifies the operator for rendering the `:operator` keyword of topic during subscribing.
    read: <string>

    # Specifies the operator for rendering the `:operator` keyword of topic during publishing.
    write: <string>

```

### Templated Topic

Octopus provides a **templated topic** to adapt to different MQTT publish and subscribe scenarios. There is five keywords supported in templated topic:

- `:namespace`, replaces with DeviceLink's [Namespace](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L147).
- `:name`, replaces with DeviceLink's [Name](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L118).
- `:uid`, replaces with DeviceLink's [UID](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L167).
- `:path`, replaces with custom path.
- `:operator`, replaces based on operation(`read` - [subscribe](https://www.hivemq.com/blog/mqtt-essentials-part-4-mqtt-publish-subscribe-unsubscribe/#subscribe), `write` - [publish](https://www.hivemq.com/blog/mqtt-essentials-part-4-mqtt-publish-subscribe-unsubscribe/#publish)). _It is worth noting that `read` operations are not supported in MQTT extension, but work well in [MQTT adaptor](./mqtt.md)._

Templated topic has two features as below:

- Fault-tolerant extra separator, `path: "a///b///c"` will treat as `path: "a/b/c"`.
- Automatically ignore keywords without content.

#### Usage Cases

1. Given topic `cattle.io/octopus/:namespace/device/:name`, when the DeviceLink is named as `default/case1`:
    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      namespace: default
      name: case1
      uid: fcd1eb1b-ea42-4cb9-afb0-0ec2d0830583
    spec:
      ...
      template:
        ...
        spec:
          extension:
            mqtt:
              ...
              message:
                topic: "cattle.io/octopus/:namespace/device/:name"
    ```

    - Publish Topic: `cattle.io/octopus/default/device/case1`
    - Subscribe Topic: `cattle.io/octopus/default/device/case1`

1. Given topic `cattle.io/octopus/device/:uid`, when the DeviceLink is named as `default/case2`:

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      namespace: default
      name: case2
      uid: 41478d1e-c3f8-46e3-a3b5-ba251f285277
    spec:
      ...
      template:
        ...
        spec:
          extension:
            mqtt:
              ...
              message:
                topic: "cattle.io/octopus/device/:uid"
    ```

    - Publish Topic: `cattle.io/octopus/device/41478d1e-c3f8-46e3-a3b5-ba251f285277`
    - Subscribe Topic: `cattle.io/octopus/device/41478d1e-c3f8-46e3-a3b5-ba251f285277`

    > UID is the unique identify provided by Kubernetes to represent the resource, and there is not much reading meaning to the outside. Therefore, it is not recommended to use this keyword in general cases.

1. Given topic `cattle.io/octopus/:operator/device/:namespace/:name`, when the DeviceLink is named as `default/case3`:

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      namespace: default
      name: case3
      uid: 835aea2e-5f80-4d14-88f5-40c4bda41aa3
    spec:
      ...
      template:
        ...
        spec:
          extension:
            mqtt:
              ...
              message:
                topic: "cattle.io/octopus/:operator/device/:namespace/:name"
                operator:
                  write: "set"
    ```

    - Publish Topic: `cattle.io/octopus/set/device/default/case3`
    - Subscribe Topic: `cattle.io/octopus/device/default/case3`

1. Given topic `cattle.io/octopus/:operator/device/:path/:uid`, when the DeviceLink is named as `default/case4`:

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      namespace: default
      name: case4
      uid: 014997f5-1f12-498b-8631-d2f22920e20a
    spec:
      ...
      template:
        ...
        spec:
          extension:
            mqtt:
              ...
              message:
                topic: "cattle.io/octopus/:operator/device/:path/:uid"
                operator:
                  read: "status"
                path: "region/ap"
    ```

    - Publish Topic: `cattle.io/octopus/device/region/ap/014997f5-1f12-498b-8631-d2f22920e20a`
    - Subscribe Topic: `cattle.io/octopus/status/device/region/ap/014997f5-1f12-498b-8631-d2f22920e20a`

## Supported Adaptors

- [ble](./ble.md)
- [modbus](./modbus.md)
- [opcua](./opc-ua.md)
- [dummy](./dummy.md)

