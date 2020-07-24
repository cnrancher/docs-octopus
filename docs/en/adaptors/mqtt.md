---
id: mqtt
title: MQTT Adaptor
---

## Introduction

[MQTT](http://mqtt.org/) is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol. It was designed as an extremely lightweight publish/subscribe messaging transport. It is useful for connections with remote locations where a small code footprint is required and/or network bandwidth is at a premium.

MQTT adaptor implements on [paho.mqtt.golang](https://github.com/eclipse/paho.mqtt.golang) and helps to communicate with the MQTT broker to interact with linking equipment.

### Gossip

#### Data Structure

As we know, MQTT is structure-agnostic, so there is no standard **topic** naming schema and **payload** format. The way the publisher organizes the data structure will directly affect the usage of the subscriber. In the community, we have summarized two common patterns. Let's take a look below.

The first pattern can be named as **Attributed Topic**: the publisher flattens properties into topics, and then sends the property's payload to corresponding topic. It has a representative on Github: the [Homie](https://homieiot.github.io/) MQTT convention.

```
homie/kitchen/$homie -> 4.0
homie/kitchen/$name  -> "Living Room"
homie/kitchen/$node  -> "light,door"
homie/kitchen/$state -> "ready"

homie/kitchen/light/$name -> "Living room light"
homie/kitchen/light/$type -> "LED"
homie/kitchen/light/$properties -> "switch,gear,parameter_power,parameter_luminance,manufacturer,production_date,service_life"
...

homie/kitchen/light/switch/$name -> "The switch of light"
homie/kitchen/light/switch/$settable -> "true"
homie/kitchen/light/switch/$datatype -> "boolean"
homie/kitchen/light/switch -> "false"
...
homie/kitchen/light/parameter_power/$name -> "The power of light"
homie/kitchen/light/parameter_power/$settable -> "false"
homie/kitchen/light/parameter_power/$datatype -> "float"
homie/kitchen/light/parameter_power/$unit -> "watt"
homie/kitchen/light/parameter_power -> "3.0"
    ...
```

Homie is interesting, its biggest feature is **self-discovery**, which means subscriber doesn't need to know the data structure and just subscribe the root topic, and then the convention implementation client will reflect all properties, including the name, description, value, type and so on. However, **Attributed Topic** pattern creates a lot of topics, so it needs a Homie-like convention to ensure standardization and extensibility. 

Another pattern of directly compressing attributes into one payload can be named as **Attributed Message**: The publisher serializes properties as one target format, such as XML, JSON or custom form, and then sends the entire serialized result to a topic. 

```
home/bedroom/light -> {"switch":true,"action":{"gear":"low"},"parameter":{"power":70,"luminance":4900},"production":{"manufacturer":"Rancher Octopus Fake Device","date":"2020-07-09T13:00:00.00Z","serviceLife":"P1Y0M0D"}}
```

**Attributed Message** pattern is topic saving, but the subscriber needs to know how to deserialize the payload in each topic and understand the organizational structure of data. A better way is to use the same serialization format in all topics and introduce a hierarchical description of the data structure. For example, if publisher choose JSON as the serialization format, publisher can attach the [JSONSchema](https://json-schema.org/) of data structure in another topic.

```
home/bedroom/light/$schema -> {"$schema":"http://json-schema.org/draft-04/schema#","type":"object","additionalProperties":true,"properties":{"switch":{"description":"The switch of light","type":"boolean"},"action":{"description":"The action of light","type":"object","additionalProperties":true,"properties":{"gear":{"description":"The gear of power","type":"string"}}},"parameter":{"description":"The parameter of light","type":"object","additionalProperties":true,"properties":{"power":{"description":"The power of light","type":"float"},"luminance":{"description":"The luminance of light","type":"int"}}},"production":{"description":"The production information of light","type":"object","additionalProperties":true,"properties":{"manufacturer":{"description":"The manufacturer of light","type":"string"},"date":{"description":"The production date of light","type":"string"},"serviceLife":{"description":"The service life of light","type":"string"}}}}}
```

#### Operation

In MQTT, there are only two ways of **pub/sub** for data: either perform **pub/sub** on the same topic, or divide **pub/sub** into two topics. 

The first way is not popular, it may need to add operation commands to the payload.

```
home/light -> {"$data":{"on":true,"brightness":4,"power":{"powerDissipation":"10KWH","electricQuantity":19.99}}}

home/light <- {"$set":{"on":false}}
home/light -> {"$set":{"on":false}}
```

Although a system that uses declarative management(like [Kubernetes](http://kubernetes.io/)) can avoid the above imperative operation, it is necessary to introduce a **sub** when the publisher did **pub**, which is unacceptable in an extremely low-power environment.

```
home/light -> {"on":true,"brightness":4,"power":{"powerDissipation":"10KWH","electricQuantity":19.99}}

home/light <- {"on":false}
home/light -> {"on":false}
```

Therefore, the second way will be more easily to accept. Since the properties have been flatten in **Attributed Topic** pattern, the publisher can send the data to the topic with special suffix corresponding to the property. For example, the Homie prefers to use a topic with `set` ending to receive value changes.

```
homie/light/on/$settable -> "true"
homie/light/on -> "true"

homie/light/on/set <- "false"
homie/light/on -> "false"
```

The same is true for **Attributed Message** pattern, expect that the publisher need to choose whether to only send modified properties or all properties.

```
home/light -> {"on":"true","brightness":4,"power":{"dissipation":"10KWH","quantity":19.99}}

home/light/set <- {"on":false}
home/light -> {"on":false}
```

### Convention

MQTTDevice integrated the configuration of [MQTT extension](./mqtt-extension.md#specification).

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "..."
+       client:
+         ...
+       message:
+         ...
      ...
```

#### AttributedTopic Pattern

Specifies `pattern: AttributedTopic` to interact with equipment that flattens its properties in multiple topics.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
+       pattern: "AttributedTopic"
        client:
          ...
        message:
          ...
      ...
```

Specifies [templated topic](./mqtt-extension.md#templated-topic) with `:path` keyword to render the target topic corresponding to property name.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          ...
        message:
+         topic: "cattle.io/octopus/home/your/device/:path"
      properties:
+       # subscribes to "cattle.io/octopus/home/your/device/property-a" topic
+       - name: property-a
+         type: string
```

Or explicitly indicates the `:path` with `path` field.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          ...
        message:
          topic: "cattle.io/octopus/home/your/device/:path"
      properties:
        # subscribes to "cattle.io/octopus/home/your/device/property-a" topic
        - name: property-a
          type: string
+       # subscribes to "cattle.io/octopus/home/your/device/path/to/property-b" topic
+       - name: property-b
+         path: "path/to/property-b"
+         type: string
```

Specifies a writable property with `readOnly: false`.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          ...
        message:
          topic: "cattle.io/octopus/home/your/device/:path"
      properties:
        # subscribes to "cattle.io/octopus/home/your/device/property-a" topic
        - name: property-a
          type: string
        # subscribes to "cattle.io/octopus/home/your/device/path/to/property-b" topic
        - name: property-b
          path: "path/to/property-b"
          type: string
+       # subscribes to "cattle.io/octopus/home/your/device/property-c" topic
+       # publishes  to "cattle.io/octopus/home/your/device/property-c" topic
+       - name: property-c
+         readOnly: false
+         type: string
```

Changes the writable property to publish to another topic.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          ...
        message:
-         topic: "cattle.io/octopus/home/your/device/:path"
+         topic: "cattle.io/octopus/home/your/device/:path/:operator"
+         operator:
+           write: "set"
      properties:
        # subscribes to "cattle.io/octopus/home/your/device/property-a" topic
        - name: property-a
          type: string
        # subscribes to "cattle.io/octopus/home/your/device/path/to/property-b" topic
        - name: property-b
          path: "path/to/property-b"
          type: string
        # subscribes to "cattle.io/octopus/home/your/device/property-c" topic
-       # publishes  to "cattle.io/octopus/home/your/device/property-c" topic
+       # publishes  to "cattle.io/octopus/home/your/device/property-c/set" topic
        - name: property-c
          readOnly: false
          type: string
```

Note that `:operator` can be overwritten.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          ...
        message:
          topic: "cattle.io/octopus/home/your/device/:path/:operator"
          operator:
            write: "set"
      properties:
        # subscribes to "cattle.io/octopus/home/your/device/property-a" topic
        - name: property-a
          type: string
        # subscribes to "cattle.io/octopus/home/your/device/path/to/property-b" topic
        - name: property-b
          path: "path/to/property-b"
          type: string
        # subscribes to "cattle.io/octopus/home/your/device/property-c" topic
-       # publishes  to "cattle.io/octopus/home/your/device/property-c/set" topic
+       # publishes  to "cattle.io/octopus/home/your/device/property-c/update" topic
        - name: property-c
          readOnly: false
          type: string
+         operator:
+           write: "update"
```

#### AttributedMessage

Specifiy `pattern: AttributedMessage` to interact with equipment that compresses its properties in one topic.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
+      pattern: "AttributedMessage"
       client:
         ...
       message:
         ...
      ...
```

:::note
`AttributedMessage` pattern only supports JSON format payload content at present.
:::

If the JSON of payload content looks as below:

```
{
    "property-a":"value-a",
    "property-b":false,
    "property-c":{
        "c1":"c1",
        "c2":[
            "c2.1",
            "c2.2"
        ]
    }
}

```

Extracts the content via property `name`.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedMessage"
        client:
          ...
        message:
+         # subscribes to "cattle.io/octopus/home/your/device" topic
+         topic: "cattle.io/octopus/home/your/device"
      properties:
+       # extracts the content of the corresponding JSONPath: "property-a"
+       - name: property-a
+         type: string
```

Or indicate the retrival [JSONPath](#jsonpath) in `path` field.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedMessage"
        client:
          ...
        message:
          # subscribes to "cattle.io/octopus/home/your/device" topic
          topic: "cattle.io/octopus/home/your/device"
      properties:
        # extracts the content of the corresponding JSONPath: "property-a"
        - name: property-a
          type: string
+       # extracts the content of the corresponding JSONPath: "property-c.c1"
+       - name: c1
+         path: "property-c.c1"
+         type: "string"
```

Specifies a writable property with `readOnly: false`.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedMessage"
        client:
          ...
        message:
          # subscribes to "cattle.io/octopus/home/your/device" topic
          topic: "cattle.io/octopus/home/your/device"
      properties:
        # extracts the content of the corresponding JSONPath: "property-a"
        - name: property-a
          type: string
        # extracts the content of the corresponding JSONPath: "property-c.c1"
        - name: c1
          path: "property-c.c1"
          type: "string"
+       # extracts the content of the corresponding JSONPath: "property-b",
+       # and publishs to "cattle.io/octopus/home/your/device" if indicated the value.
+       - name: property-b
+         type: boolean
+         readOnly: false
```

Changes the publish topic.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  adaptor:
    ...
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedMessage"
        client:
          ...
        message:
          # subscribes to "cattle.io/octopus/home/your/device" topic
          topic: "cattle.io/octopus/home/your/device"
+         operator:
+           write: "set"
      properties:
        # extracts the content of the corresponding JSONPath: "property-a"
        - name: property-a
          type: string
        # extracts the content of the corresponding JSONPath: "property-c.c1"
        - name: c1
          path: "property-c.c1"
          type: "string"
        # extracts the content of the corresponding JSONPath: "property-b",
-       # and publishes to "cattle.io/octopus/home/your/device" if indicated the value.
+       # and publishes the '{"property-b":true}' to "cattle.io/octopus/home/your/device/set".
        - name: property-b
          type: boolean
          readOnly: false
+         value: true
```

### JSONPath

:::note
JSONPath is only available in `AttributedMessage` pattern.
:::

MQTT adaptor has integrated both [tidwall/gjson](https://github.com/tidwall/gjson) and [tidwall/sjson](https://github.com/tidwall/sjson). 

For **Read Only** property, `path` field can accept [GJSON Path Syntax](https://github.com/tidwall/gjson/blob/master/SYNTAX.md), which is an amazing and richable path retrieval mechanism.

```
# given JSON

{
  "name": {"first": "Tom", "last": "Anderson"},
  "age": 37,
  "children": ["Sara","Alex","Jack"],
  "fav.movie": "Deer Hunter",
  "friends": [
    {"first": "Dale", "last": "Murphy", "age": 44, "nets": ["ig", "fb", "tw"]},
    {"first": "Roger", "last": "Craig", "age": 68, "nets": ["fb", "tw"]},
    {"first": "Jane", "last": "Murphy", "age": 47, "nets": ["ig", "tw"]}
  ]
}

# basic retrival
name.last -> "Anderson"

# array retrival
children.0 -> "Sara"

# wildcards
child*.2 -> " Jack"

# queries
friends.#(last=="Murphy").first -> "Dale"
```

However, against **Writable** property, `path` field can only accept _restricted_ [SJSON Path Syntax](https://github.com/tidwall/sjson#path-syntax).

```

# given JSON

{
  "name": {"first": "Tom", "last": "Anderson"},
  "age": 37,
  "children": ["Sara","Alex","Jack"],
  "fav.movie": "Deer Hunter",
  "friends": [
    {"first": "James", "last": "Murphy"},
    {"first": "Roger", "last": "Craig"}
  ]
}

# basic patch
name.last <- "Murphy"

# array patch
children.1 <- "Frank"
```

In order to ensure consistent read/write path for a property, MQTT adaptor prevents the following paths on **Writable** property:

- `children.-1` is not allowed;
- `children|@reverse` is not allowed;
- `child*.2` is not allowed;
- `c?ildren.0` is not allowed;
- `friends.#.first` is not allowed.

### User Story

Imagine that our home appliances are very smart and can actively report their status information to an MQTT broker, and then we will use `MQTTDevice` to link these information. For example, our kitchen door can tell us its production information, its closed status and so on.

```
cattle.io/octopus/home/status/kitchen/door/state -> open
...
cattle.io/octopus/home/status/kitchen/door/production_material -> wood
```

We can define a `MQTTDevice` device link with `AttributedTopic` pattern to watch our kitchen door.

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  namespace: smart-home
  name: kitchen-door
spec:
  adaptor:
    node: kitchen
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          server: "..."
        message:
          topic: "cattle.io/octopus/home/status/kitchen/door/:path"
      properties:
        - name: "state"
          type: "string"
        ...
        - name: "material"
          path: "production_material"
          type: "string"
```

> In `AttributedTopic` pattern, each `property` is a topic. By default, the `name` of property can be used as the `:path` keyword to render the topic, and finally get the corresponding topic to subscribe. 

The kitchen light also reports its properties to MQTT broker and allow us to control it remotely.

```
cattle.io/octopus/home/status/kitchen/light/switch -> false
cattle.io/octopus/home/get/kitchen/light/gear -> low
...

# to turn on the kitchen light
cattle.io/octopus/home/set/kitchen/light/switch <- true
# to control the kitchen light
cattle.io/octopus/hom/control/kitchen/light/gear <- mid
```

We can use the writable properties of `MQTTDevice` device link to control the kitchen light.

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  namespace: smart-home
  name: kitchen-light
spec:
  adaptor:
    node: kitchen
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          server: "..."
        message:
          topic: "cattle.io/octopus/home/:operator/kitchen/light/:path"
          operator:
            read: "status"
            write: "set"
      properties:
        - name: "switch"
          type: "boolean"
          readOnly: false
        - name: "gear"
          type: "string"
          readOnly: false
          operator:
            read: "get"
            write: "control"
        ...
```

> Use `readOnly: false` to conifgure a writable property. In addition, the property level `operator` can override the definition of the protocol level in `AttributedTopic` pattern.

For example, we can _turn on_ the kitchen light and adjust it to _mid_ level.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  namespace: smart-home
  name: kitchen-light
spec:
  ...
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          server: "..."
        message:
          topic: "cattle.io/octopus/home/:operator/kitchen/light/:path"
          operator:
            read: "status"
            write: "set"
      properties:
        - name: "switch"
          type: "boolean"
          readOnly: false
+         value: true
        - name: "gear"
          type: "string"
          readOnly: false
          operator:
            read: "get"
            write: "control"
+          value: "mid"
        ...
```

Futher, we can monitor the status of door and light in the same `MQTTDevice` device link.

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  namespace: smart-home
  name: kitchen-monitor
spec:
  adaptor:
    node: kitchen
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedTopic"
        client:
          server: "..."
        message:
          topic: "cattle.io/octopus/home/:operator/kitchen/:path"
          operator:
            read: status
      properties:
        - name: "doorState"
          path: "door/state"
          type: "string"
        - name: "isLightOn"
          path: "light/switch"
          type: "boolean"
        - name: "lightGear"
          path: "light/gear"
          type: "string"
          operator:
            read: get
```

Recently we bought a new smart bedroom light, but we found that the format of the transmitted data is different from the previous one.

```
cattle.io/octopus/home/bedroom/light -> {"switch":true,"action":{"gear":"low"},"parameter":{"power":70,"luminance":4900},"production":{"manufacturer":"Rancher Octopus Fake Device","date":"2020-07-09T13:00:00.00Z","serviceLife":"P1Y0M0D"}}

# to turn off the bedroom light
cattle.io/octopus/home/bedroom/light/set <- {"switch":false}
# to control the kitchen light
cattle.io/octopus/home/bedroom/light/set <- {"action":{"gear":"mid"}}
```

We can define a `MQTTDevice` device link with `AttributedMessage` pattern to monitor the new bedroom light.

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  namespace: smart-home
  name: bedroom-light
spec:
  adaptor:
    node: bedroom
    name: adaptors.edge.cattle.io/mqtt
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MQTTDevice"
  template:
    spec:
      protocol:
        pattern: "AttributedMessage"
        client:
          server: "..."
        message:
          topic: "cattle.io/octopus/home/bedroom/light"
      properties:
        - name: "switch"
          type: "boolean"
        - name: "gear"
          path: "action.gear"
          type: "string"
        ...
        - name: "serviceLife"
          path: "production.serviceLife"
          type: "string"
```

> In `AttributedMessage` pattern, the whole link is a topic. By default, the `name` of property can be used as the retrieval path of payload content.


We can modify the above `MQTTDevice` device link if needed to turn off the new bedroom light.

```diff
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  namespace: smart-home
  name: bedroom-light
spec:
  ...
  template:
    ...
    spec:
      protocol:
        pattern: "AttributedMessage"
        client:
          server: "..."
        message:
-         topic: "cattle.io/octopus/home/bedroom/light"
+         topic: "cattle.io/octopus/home/bedroom/light/:operator"
+         operator:
+           write: "set"
      properties:
        - name: "switch"
          type: "boolean"
+         readOnly: false
+         value: false
        - name: "gear"
          path: "action.gear"
          type: "string"
        ...
        - name: "serviceLife"
          path: "production.serviceLife"
          type: "string"
```

## Registration Information

|  Versions | Register Name | Endpoint Socket | Available |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/mqtt` | `mqtt.sock` | * |

## Support Model

| Kind | Group | Version | Available | 
|:---|:---|:---|:---|
| `MQTTDevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

## Support Platform

| OS | Arch |
|:---|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## Usage

```shell script
kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/mqtt/deploy/e2e/all_in_one.yaml
```

## Authority

Grant permissions to Octopus as below <!-- kubectl describe clusterrole ... -->:

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  mqttdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  mqttdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

## Example

- Specifies a `MQTTDevice` device link to subscribe the information of kitchen room door.

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: kitchen-door
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/mqtt
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "MQTTDevice"
      template:
        metadata:
          labels:
            device: kitchen-door
        spec:
          protocol:
            pattern: "AttributedTopic"
            client:
              server: "tcp://test.mosquitto.org:1883"
            message:
              topic: "cattle.io/octopus/home/status/kitchen/door/:path"
          properties:
            - name: "state"
              path: "state"
              description: "The state of door"
              type: "string"
              annotations:
                type: "enum"
                format: "open,close"
            - name: "width"
              path: "width"
              description: "The width of door"
              type: "float"
              annotations:
                unit: "meter"
            - name: "height"
              path: "height"
              description: "The height of door"
              type: "float"
              annotations: 
                unit: "meter"
            - name: "material"
              path: "material"
              description: "The material of light"
              type: "string"
    ```

- Specifies a `MQTTDevice` device link to manage the bedroom light.

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: bedroom-light
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/mqtt
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "MQTTDevice"
      template:
        metadata:
          labels:
            device: bedroom-light
        spec:
          protocol:
            pattern: "AttributedMessage"
            client:
              server: "tcp://test.mosquitto.org:1883"
            message:
              topic: "cattle.io/octopus/home/bedroom/light/:operator"
              operator:
                write: "set"
          properties:
            - name: "switch"
              path: "switch"
              description: "The switch of light"
              type: "boolean"
              readOnly: false
            - name: "gear"
              path: "action.gear"
              description: "The gear of light"
              type: "string"
              readOnly: false
              annotations:
                type: "enum"
                format: "low,mid,high"
            - name: "power"
              path: "parameter.power"
              description: "The power of light"
              type: "float"
              annotations:
                group: "parameter"
                unit: "watt"
            - name: "luminance"
              path: "parameter.luminance"
              description: "The luminance of light"
              type: "int"
              annotations:
                group: "parameter"
                unit: "luminance"
            - name: "manufacturer"
              path: "production.manufacturer"
              description: "The manufacturer of light"
              type: "string"
              annotations:
                group: "production"
            - name: "productionDate"
              path: "production.date"
              description: "The production date of light"
              type: "string"
              annotations:
                group: "production"
                type: "datetime"
                standard: "ISO 8601"
                format: "YYYY-MM-DDThh:mm:ss.SSZ"
            - name: "serviceLife"
              path: "production.serviceLife"
              description: "The service life of light"
              type: "string"
              annotations:
                group: "production"
                type: "duration"
                standard: "ISO 8601"
                format: "PYYMMDD"
    ```

For more `MQTTDevice` device link examples, please refer to the [deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/mqtt/deploy/e2e) directory and make a quick experience with [deploy/e2e/simulator.yaml](https://github.com/cnrancher/octopus/tree/master/adaptors/mqtt/deploy/e2e).

## MQTTDevice

Parameter | Description | Schema | Required
:--- | :--- | :--- | :---
metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false
spec | Defines the desired state of `MQTTDevice`. | [MQTTDeviceSpec](#mqttdevicespec) | true
status | Defines the observed state of `MQTTDevice`. | [MQTTDeviceStatus](#mqttdevicestatus) | false

### MQTTDeviceSpec

Parameter | Description | Schema | Required
:--- | :--- | :--- | :---
protocol | Specifies the protocol for accessing the MQTT service. | [MQTTDeviceProtocol](#mqttdeviceprotocol) | true
properties | Specifies the properties of device. | [[]MQTTDeviceProperty](#mqttdeviceproperty) | false

### MQTTDeviceStatus

Parameter | Description | Schema | Required
:--- | :--- | :--- | :---
properties | Reports the properties of device. | [[]MQTTDeviceStatusProperty](#mqttdevicestatusproperty) | false

#### MQTTDeviceProtocol

Parameter | Description | Schema | Required
:--- | :--- | :--- | :---
pattern | Specifies the pattern of MQTTDevice protocol. | [MQTTDevicePattern](#mqttdevicepattern) | true
client | Specifies the client settings. | [MQTTClientOptions](./mqtt-extension.md#mqttclientoptions) | true
message | Specifies the message settings. | [MQTTMessageOptions](./mqtt-extension.md#mqttmessageoptions) | true

#### MQTTDevicePattern

Parameter | Description | Schema
:--- | :--- | :---
AttributedMessage | Compress properties into one message, one topic has its all property values. | string 
AttributedTopic | Flatten properties to topic, each topic has its own property value. | string  

#### MQTTDeviceProperty

Parameter | Description | Schema | Required
:--- | :--- | :--- | :---
annotations | Specifies the annotations of property. | map[string]string | false
name | Specifies the name of property. | string | true
description | Specifies the description of property. | string | false
readOnly | Specifies if the property is read-only, default to `true`. | *bool | false
type | Specifies the type of property. | [MQTTDevicePropertyType](#mqttdevicepropertytype) | true
value | Specifies the value of property, only available in the writable property. | [MQTTDevicePropertyValue](#mqttdevicepropertyvalue) | false
path | Specifies the path for rendering the `:path` keyword of topic, default is the same as the `name`. <br/><br/> In `AttributedTopic` pattern, this path will be rendered on topic; <br/> In `AttributedMessage` pattern, this path should be a [`JSONPath`](#jsonpath) which can access the payload content. | string | false
operator | Specifies the operator for rendering the `:operator` keyword of topic. | *[MQTTMessageTopicOperator](./mqtt-extension.md#mqttmessagetopicoperator) | false
qos | Specifies the QoS of the message, only available in `AttributedTopic` pattern. The default value is `1`. | *[MQTTMessageQoSLevel](./mqtt-extension.md#mqttmessageqoslevel) | false
retained | Specifies if the last published message to be retained, only available in `AttributedTopic` pattern. The default is `true`. | *bool | false

> In fact, MQTT adaptor will return the original data received by MQTT broker. Therefore, the meaning of `type` is not to tell MQTT adaptor how to deal with the payload, but for user to describe what is expected.

#### MQTTDeviceStatusProperty

Parameter | Description | Schema | Required
:--- | :--- | :--- | :---
annotations | Reports the annotations of property. | map[string]string | false
name | Reports the name of property. | string | false
description | Reports the description of property. | string | false
readOnly | Reports if the property is read-only. | *bool | false
type | Reports the type of property. <br/> | [MQTTDevicePropertyType](#mqttdevicepropertytype) | false
value | Reports the value of property. | [MQTTDevicePropertyValue](#mqttdevicepropertyvalue) | false
path | Reports the path for rendering the `:path` keyword of topic, default is the same as the `name` | string | false
operator | Reports the operator for rendering the `:operator` keyword of topic. | *[MQTTMessageTopicOperator](./mqtt-extension.md#mqttmessagetopicoperator) | false
qos | Reports the QoS of the message. | *[MQTTMessageQoSLevel](./mqtt-extension.md#mqttmessageqoslevel) | false
retained | Reports if the last published message to be retained. | *bool | false
updatedAt | Reports the updated timestamp of property. | *[metav1.Time](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/time.go#L33) | false

#### MQTTDevicePropertyType

Parameter | Description | Schema
:--- | :--- | :---
string | Property data type is string. | string
int | Property data type is int. | string
float | Property data type is float. | string
boolean | Property data type is boolean. | string
array | Property data type is array. | string
object | Property data type is object. | string

#### MQTTDevicePropertyValue

MQTTDevicePropertyValue needs to be inputed with the corresponding content according to the `type`. For example:

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  ...
  template:
    ...
    spec:
      ...
      properties:
        - name: "string"
          readOnly: false
          type: "string"
          value: "str"
        - name: "int"
          readOnly: false
          type: "int"
          value: 1
        - name: "float"
          readOnly: false
          type: "float"
          value: 3.3
        - name: "bool"
          readOnly: false
          type: "boolean"
          value: true
        - name: "array"
          readOnly: false
          type: "array"
          value:
            - item-1
            - item-2
            - item-3
        - name: "object"
          readOnly: false
          type: "object"
          value:
            name: "james"
            age: 12
```
