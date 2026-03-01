# NotificationsApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteNotification**](NotificationsApi.md#deletenotification) | **DELETE** /notifications/{notification_id} | Delete notification |
| [**getNotification**](NotificationsApi.md#getnotification) | **GET** /notifications/{notification_id} | Get notification detail |
| [**listNotifications**](NotificationsApi.md#listnotifications) | **GET** /notifications | List user\&#39;s notifications |
| [**markNotificationAsRead**](NotificationsApi.md#marknotificationasread) | **POST** /notifications/{notification_id}/read | Mark notification as read |



## deleteNotification

> DeleteAccount200Response deleteNotification(notificationId)

Delete notification

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { DeleteNotificationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationsApi(config);

  const body = {
    // string
    notificationId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteNotificationRequest;

  try {
    const data = await api.deleteNotification(body);
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
| **notificationId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Notification deleted |  -  |
| **401** | Unauthorized |  -  |
| **404** | Notification not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNotification

> NotificationOut getNotification(notificationId)

Get notification detail

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { GetNotificationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationsApi(config);

  const body = {
    // string
    notificationId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetNotificationRequest;

  try {
    const data = await api.getNotification(body);
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
| **notificationId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**NotificationOut**](NotificationOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification details |  -  |
| **401** | Unauthorized |  -  |
| **404** | Notification not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listNotifications

> Array&lt;NotificationOut&gt; listNotifications()

List user\&#39;s notifications

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { ListNotificationsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationsApi(config);

  try {
    const data = await api.listNotifications();
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

[**Array&lt;NotificationOut&gt;**](NotificationOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of notifications |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## markNotificationAsRead

> MarkNotificationAsRead200Response markNotificationAsRead(notificationId)

Mark notification as read

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { MarkNotificationAsReadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationsApi(config);

  const body = {
    // string
    notificationId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies MarkNotificationAsReadRequest;

  try {
    const data = await api.markNotificationAsRead(body);
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
| **notificationId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**MarkNotificationAsRead200Response**](MarkNotificationAsRead200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification marked as read |  -  |
| **404** | Notification not found |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

