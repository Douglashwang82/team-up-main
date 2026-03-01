# TicketsApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createTicket**](TicketsApi.md#createticket) | **POST** /tickets | Create a new ticket |
| [**deleteTicket**](TicketsApi.md#deleteticket) | **DELETE** /tickets/{ticket_id} | Delete ticket |
| [**getTicket**](TicketsApi.md#getticket) | **GET** /tickets/{ticket_id} | Get ticket details with matched events |
| [**listTickets**](TicketsApi.md#listtickets) | **GET** /tickets | List user\&#39;s tickets |
| [**updateTicket**](TicketsApi.md#updateticket) | **PUT** /tickets/{ticket_id} | Update ticket |



## createTicket

> TicketOut createTicket(ticketCreateIn)

Create a new ticket

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { CreateTicketRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TicketsApi(config);

  const body = {
    // TicketCreateIn
    ticketCreateIn: ...,
  } satisfies CreateTicketRequest;

  try {
    const data = await api.createTicket(body);
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
| **ticketCreateIn** | [TicketCreateIn](TicketCreateIn.md) |  | |

### Return type

[**TicketOut**](TicketOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Ticket created |  -  |
| **400** | Invalid input |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteTicket

> DeleteAccount200Response deleteTicket(ticketId)

Delete ticket

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { DeleteTicketRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TicketsApi(config);

  const body = {
    // string
    ticketId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteTicketRequest;

  try {
    const data = await api.deleteTicket(body);
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
| **ticketId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Ticket deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Ticket not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTicket

> TicketDetailOut getTicket(ticketId)

Get ticket details with matched events

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { GetTicketRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TicketsApi(config);

  const body = {
    // string
    ticketId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetTicketRequest;

  try {
    const data = await api.getTicket(body);
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
| **ticketId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**TicketDetailOut**](TicketDetailOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ticket details with matched events |  -  |
| **401** | Unauthorized |  -  |
| **403** | Not the ticket owner |  -  |
| **404** | Ticket not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTickets

> Array&lt;TicketOut&gt; listTickets()

List user\&#39;s tickets

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { ListTicketsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TicketsApi(config);

  try {
    const data = await api.listTickets();
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

[**Array&lt;TicketOut&gt;**](TicketOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of tickets |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateTicket

> TicketDetailOut updateTicket(ticketId, ticketUpdateIn)

Update ticket

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { UpdateTicketRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TicketsApi(config);

  const body = {
    // string
    ticketId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // TicketUpdateIn
    ticketUpdateIn: ...,
  } satisfies UpdateTicketRequest;

  try {
    const data = await api.updateTicket(body);
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
| **ticketId** | `string` |  | [Defaults to `undefined`] |
| **ticketUpdateIn** | [TicketUpdateIn](TicketUpdateIn.md) |  | |

### Return type

[**TicketDetailOut**](TicketDetailOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ticket updated |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Ticket not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

