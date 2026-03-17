# ChatApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**clearMessages**](ChatApi.md#clearmessages) | **DELETE** /chat/messages | Clear chat history |
| [**listMessages**](ChatApi.md#listmessages) | **GET** /chat/messages | List chat messages |
| [**postMessage**](ChatApi.md#postmessage) | **POST** /chat/messages | Send a chat message |



## clearMessages

> DeleteAccount200Response clearMessages()

Clear chat history

### Example

```ts
import {
  Configuration,
  ChatApi,
} from '';
import type { ClearMessagesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ChatApi(config);

  try {
    const data = await api.clearMessages();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**DeleteAccount200Response**](DeleteAccount200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Chat history cleared |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listMessages

> Array&lt;ChatMessageOut&gt; listMessages(limit, cursor)

List chat messages

### Example

```ts
import {
  Configuration,
  ChatApi,
} from '';
import type { ListMessagesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ChatApi(config);

  const body = {
    // number | Number of messages to return (optional)
    limit: 56,
    // string | UUID of the message to paginate before (optional)
    cursor: cursor_example,
  } satisfies ListMessagesRequest;

  try {
    const data = await api.listMessages(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **limit** | `number` | Number of messages to return | [Optional] [Defaults to `20`] |
| **cursor** | `string` | UUID of the message to paginate before | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;ChatMessageOut&gt;**](ChatMessageOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of chat messages |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postMessage

> ChatMessageOut postMessage(chatMessageIn)

Send a chat message

### Example

```ts
import {
  Configuration,
  ChatApi,
} from '';
import type { PostMessageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ChatApi(config);

  const body = {
    // ChatMessageIn
    chatMessageIn: ...,
  } satisfies PostMessageRequest;

  try {
    const data = await api.postMessage(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **chatMessageIn** | [ChatMessageIn](ChatMessageIn.md) |  | |

### Return type

[**ChatMessageOut**](ChatMessageOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Message created |  -  |
| **401** | Unauthorized |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

