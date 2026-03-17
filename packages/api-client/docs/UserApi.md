# UserApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**cancelUserJoinRequest**](UserApi.md#canceluserjoinrequest) | **DELETE** /user/events/join_requests/{join_request_id} | Cancel join request |
| [**getUserBookings**](UserApi.md#getuserbookings) | **GET** /user/bookings | Get user bookings |
| [**getUserEvents**](UserApi.md#getuserevents) | **GET** /user/events | Get user events (created, joined, requested) |
| [**getUserInfo**](UserApi.md#getuserinfo) | **GET** /user/info | Get user info |
| [**getUserJoinRequest**](UserApi.md#getuserjoinrequest) | **GET** /user/events/join_requests/{join_request_id} | Get single join request |
| [**getUserJoinRequests**](UserApi.md#getuserjoinrequests) | **GET** /user/events/join_requests | Get user join requests |
| [**updateUserInfo**](UserApi.md#updateuserinfooperation) | **PUT** /user/info | Update user info |



## cancelUserJoinRequest

> cancelUserJoinRequest(joinRequestId)

Cancel join request

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { CancelUserJoinRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  const body = {
    // string
    joinRequestId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CancelUserJoinRequestRequest;

  try {
    const data = await api.cancelUserJoinRequest(body);
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
| **joinRequestId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Request cancelled |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserBookings

> Array&lt;BookingOut&gt; getUserBookings()

Get user bookings

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { GetUserBookingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  try {
    const data = await api.getUserBookings();
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

[**Array&lt;BookingOut&gt;**](BookingOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of bookings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserEvents

> Array&lt;EventOut&gt; getUserEvents()

Get user events (created, joined, requested)

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { GetUserEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  try {
    const data = await api.getUserEvents();
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

[**Array&lt;EventOut&gt;**](EventOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of events |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserInfo

> UserOut getUserInfo()

Get user info

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { GetUserInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  try {
    const data = await api.getUserInfo();
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

[**UserOut**](UserOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User info |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserJoinRequest

> JoinRequestOut getUserJoinRequest(joinRequestId)

Get single join request

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { GetUserJoinRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  const body = {
    // string
    joinRequestId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetUserJoinRequestRequest;

  try {
    const data = await api.getUserJoinRequest(body);
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
| **joinRequestId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**JoinRequestOut**](JoinRequestOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Join request detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserJoinRequests

> Array&lt;JoinRequestOut&gt; getUserJoinRequests()

Get user join requests

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { GetUserJoinRequestsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  try {
    const data = await api.getUserJoinRequests();
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

[**Array&lt;JoinRequestOut&gt;**](JoinRequestOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of join requests |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateUserInfo

> UserOut updateUserInfo(updateUserInfoRequest)

Update user info

### Example

```ts
import {
  Configuration,
  UserApi,
} from '';
import type { UpdateUserInfoOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UserApi(config);

  const body = {
    // UpdateUserInfoRequest (optional)
    updateUserInfoRequest: ...,
  } satisfies UpdateUserInfoOperationRequest;

  try {
    const data = await api.updateUserInfo(body);
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
| **updateUserInfoRequest** | [UpdateUserInfoRequest](UpdateUserInfoRequest.md) |  | [Optional] |

### Return type

[**UserOut**](UserOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated user info |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

