# EventsApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**bookTimeslotForEvent**](EventsApi.md#booktimeslotforevent) | **POST** /events/{event_id}/book | Book a timeslot for Event (owner only) |
| [**createEvent**](EventsApi.md#createevent) | **POST** /events | Create a new Event |
| [**deleteEvent**](EventsApi.md#deleteevent) | **DELETE** /events/{event_id} | Delete Event |
| [**getEventById**](EventsApi.md#geteventbyid) | **GET** /events/{event_id} | Get Event details |
| [**getMyCreatedEvents**](EventsApi.md#getmycreatedevents) | **GET** /events/my/created | Get events created by the authenticated user |
| [**getMyJoinedEvents**](EventsApi.md#getmyjoinedevents) | **GET** /events/my/joined | Get events joined by the authenticated user |
| [**getMyPendingEvents**](EventsApi.md#getmypendingevents) | **GET** /events/my/pending | Get events with pending join requests |
| [**joinEvent**](EventsApi.md#joinevent) | **POST** /events/{event_id}/join | Submit join request to Event |
| [**listEventBookings**](EventsApi.md#listeventbookings) | **GET** /events/{event_id}/bookings | List all bookings for a Event |
| [**listEvents**](EventsApi.md#listevents) | **GET** /events | List and search Events |
| [**listJoinRequests**](EventsApi.md#listjoinrequests) | **GET** /events/{event_id}/join-requests | List join requests (owner only) |
| [**reviewJoinRequest**](EventsApi.md#reviewjoinrequest) | **POST** /events/{event_id}/join-requests/{request_id}/review | Review join request (owner only) |
| [**updateEvent**](EventsApi.md#updateevent) | **PUT** /events/{event_id} | Update Event |



## bookTimeslotForEvent

> EventBookingResponse bookTimeslotForEvent(eventId, eventBookTimeSlotIn)

Book a timeslot for Event (owner only)

Event owner can book multiple time slots for the team

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { BookTimeslotForEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // EventBookTimeSlotIn
    eventBookTimeSlotIn: ...,
  } satisfies BookTimeslotForEventRequest;

  try {
    const data = await api.bookTimeslotForEvent(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |
| **eventBookTimeSlotIn** | [EventBookTimeSlotIn](EventBookTimeSlotIn.md) |  | |

### Return type

[**EventBookingResponse**](EventBookingResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Timeslot booked |  -  |
| **400** | Invalid timeslot or already booked |  -  |
| **403** | Not the Event owner |  -  |
| **404** | Event or timeslot not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createEvent

> EventOut createEvent(eventCreateIn)

Create a new Event

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { CreateEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // EventCreateIn
    eventCreateIn: ...,
  } satisfies CreateEventRequest;

  try {
    const data = await api.createEvent(body);
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
| **eventCreateIn** | [EventCreateIn](EventCreateIn.md) |  | |

### Return type

[**EventOut**](EventOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Event created |  -  |
| **400** | Invalid input |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteEvent

> DeleteAccount200Response deleteEvent(eventId)

Delete Event

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { DeleteEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteEventRequest;

  try {
    const data = await api.deleteEvent(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Event deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Event not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEventById

> EventDetailOut getEventById(eventId)

Get Event details

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { GetEventByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EventsApi();

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetEventByIdRequest;

  try {
    const data = await api.getEventById(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**EventDetailOut**](EventDetailOut.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Event details |  -  |
| **404** | Event not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMyCreatedEvents

> Array&lt;EventOut&gt; getMyCreatedEvents()

Get events created by the authenticated user

Returns all events owned by the authenticated user

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { GetMyCreatedEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  try {
    const data = await api.getMyCreatedEvents();
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
| **200** | List of created events |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMyJoinedEvents

> Array&lt;EventOut&gt; getMyJoinedEvents()

Get events joined by the authenticated user

Returns all events where the authenticated user is a participant (member role)

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { GetMyJoinedEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  try {
    const data = await api.getMyJoinedEvents();
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
| **200** | List of joined events |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMyPendingEvents

> Array&lt;EventOut&gt; getMyPendingEvents()

Get events with pending join requests

Returns all events where the authenticated user has submitted join requests

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { GetMyPendingEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  try {
    const data = await api.getMyPendingEvents();
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
| **200** | List of events with pending join requests |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## joinEvent

> JoinRequestSubmitResponse joinEvent(eventId, joinRequestCreateIn)

Submit join request to Event

Submit a join request to join a Event. Authenticated users auto-fill their info, non-authenticated users must provide details. 

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { JoinEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // JoinRequestCreateIn (optional)
    joinRequestCreateIn: ...,
  } satisfies JoinEventRequest;

  try {
    const data = await api.joinEvent(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |
| **joinRequestCreateIn** | [JoinRequestCreateIn](JoinRequestCreateIn.md) |  | [Optional] |

### Return type

[**JoinRequestSubmitResponse**](JoinRequestSubmitResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Join request submitted |  -  |
| **400** | Event not open / Already applied / Event full |  -  |
| **404** | Event not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listEventBookings

> Array&lt;EventBookingDetail&gt; listEventBookings(eventId)

List all bookings for a Event

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { ListEventBookingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EventsApi();

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ListEventBookingsRequest;

  try {
    const data = await api.listEventBookings(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;EventBookingDetail&gt;**](EventBookingDetail.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of Event bookings |  -  |
| **404** | Event not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listEvents

> Array&lt;EventOut&gt; listEvents(status, visibility, keyword, datetimeAfter, division, category, limit, offset)

List and search Events

List Events with optional filtering and search. Supports filtering by status, visibility, and keyword search on title. 

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { ListEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // 'open' | 'closed' | Filter by event status (optional)
    status: status_example,
    // 'public' | 'private' | Filter by visibility (optional)
    visibility: visibility_example,
    // string | Search keyword (searches in title) (optional)
    keyword: keyword_example,
    // Date | Filter events that have time slots starting after this datetime (optional)
    datetimeAfter: 2013-10-20T19:20:30+01:00,
    // string | Filter events by venue city/division (optional)
    division: division_example,
    // string | Filter events by sport category (optional)
    category: category_example,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ListEventsRequest;

  try {
    const data = await api.listEvents(body);
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
| **status** | `open`, `closed` | Filter by event status | [Optional] [Defaults to `&#39;open&#39;`] [Enum: open, closed] |
| **visibility** | `public`, `private` | Filter by visibility | [Optional] [Defaults to `undefined`] [Enum: public, private] |
| **keyword** | `string` | Search keyword (searches in title) | [Optional] [Defaults to `undefined`] |
| **datetimeAfter** | `Date` | Filter events that have time slots starting after this datetime | [Optional] [Defaults to `undefined`] |
| **division** | `string` | Filter events by venue city/division | [Optional] [Defaults to `undefined`] |
| **category** | `string` | Filter events by sport category | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

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
| **200** | List of Events |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listJoinRequests

> Array&lt;JoinRequestOut&gt; listJoinRequests(eventId)

List join requests (owner only)

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { ListJoinRequestsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ListJoinRequestsRequest;

  try {
    const data = await api.listJoinRequests(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |

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
| **403** | Not the Event owner |  -  |
| **404** | Event not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## reviewJoinRequest

> JoinRequestReviewResponse reviewJoinRequest(eventId, requestId, joinRequestReviewIn)

Review join request (owner only)

Approve or reject a join request

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { ReviewJoinRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    requestId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // JoinRequestReviewIn
    joinRequestReviewIn: ...,
  } satisfies ReviewJoinRequestRequest;

  try {
    const data = await api.reviewJoinRequest(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |
| **requestId** | `string` |  | [Defaults to `undefined`] |
| **joinRequestReviewIn** | [JoinRequestReviewIn](JoinRequestReviewIn.md) |  | |

### Return type

[**JoinRequestReviewResponse**](JoinRequestReviewResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Review completed |  -  |
| **400** | Invalid action / Already reviewed / Event full |  -  |
| **403** | Not the Event owner |  -  |
| **404** | Event or request not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateEvent

> EventDetailOut updateEvent(eventId, eventUpdateIn)

Update Event

### Example

```ts
import {
  Configuration,
  EventsApi,
} from '';
import type { UpdateEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new EventsApi(config);

  const body = {
    // string
    eventId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // EventUpdateIn
    eventUpdateIn: ...,
  } satisfies UpdateEventRequest;

  try {
    const data = await api.updateEvent(body);
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
| **eventId** | `string` |  | [Defaults to `undefined`] |
| **eventUpdateIn** | [EventUpdateIn](EventUpdateIn.md) |  | |

### Return type

[**EventDetailOut**](EventDetailOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Event updated |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Event not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

