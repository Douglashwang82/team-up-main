# BookingsApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**cancelBooking**](BookingsApi.md#cancelbooking) | **DELETE** /bookings/{booking_id} | Cancel booking |
| [**createBooking**](BookingsApi.md#createbooking) | **POST** /bookings | Create a new booking |
| [**getBookingById**](BookingsApi.md#getbookingbyid) | **GET** /bookings/{booking_id} | Get booking details |
| [**listBookings**](BookingsApi.md#listbookings) | **GET** /bookings | List user\&#39;s bookings |
| [**updateBooking**](BookingsApi.md#updatebooking) | **PATCH** /bookings/{booking_id} | Update booking status |
| [**updateBookingFully**](BookingsApi.md#updatebookingfully) | **PUT** /bookings/{booking_id} | Update booking fully (admin) |



## cancelBooking

> DeleteAccount200Response cancelBooking(bookingId)

Cancel booking

### Example

```ts
import {
  Configuration,
  BookingsApi,
} from '';
import type { CancelBookingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookingsApi(config);

  const body = {
    // string
    bookingId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CancelBookingRequest;

  try {
    const data = await api.cancelBooking(body);
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
| **bookingId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Booking cancelled |  -  |
| **403** | Not the booking owner |  -  |
| **404** | Booking not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createBooking

> BookingOut createBooking(bookingCreateIn)

Create a new booking

### Example

```ts
import {
  Configuration,
  BookingsApi,
} from '';
import type { CreateBookingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookingsApi(config);

  const body = {
    // BookingCreateIn
    bookingCreateIn: ...,
  } satisfies CreateBookingRequest;

  try {
    const data = await api.createBooking(body);
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
| **bookingCreateIn** | [BookingCreateIn](BookingCreateIn.md) |  | |

### Return type

[**BookingOut**](BookingOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Booking created |  -  |
| **400** | Invalid timeslot or already booked |  -  |
| **401** | Unauthorized |  -  |
| **404** | Timeslot not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getBookingById

> BookingDetailOut getBookingById(bookingId)

Get booking details

### Example

```ts
import {
  Configuration,
  BookingsApi,
} from '';
import type { GetBookingByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookingsApi(config);

  const body = {
    // string
    bookingId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetBookingByIdRequest;

  try {
    const data = await api.getBookingById(body);
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
| **bookingId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**BookingDetailOut**](BookingDetailOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Booking details |  -  |
| **403** | Not the booking owner |  -  |
| **404** | Booking not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listBookings

> Array&lt;BookingOut&gt; listBookings(status, limit, offset)

List user\&#39;s bookings

### Example

```ts
import {
  Configuration,
  BookingsApi,
} from '';
import type { ListBookingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookingsApi(config);

  const body = {
    // 'pending' | 'confirmed' | 'cancelled' (optional)
    status: status_example,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ListBookingsRequest;

  try {
    const data = await api.listBookings(body);
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
| **status** | `pending`, `confirmed`, `cancelled` |  | [Optional] [Defaults to `undefined`] [Enum: pending, confirmed, cancelled] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

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
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateBooking

> BookingOut updateBooking(bookingId, bookingUpdateIn)

Update booking status

### Example

```ts
import {
  Configuration,
  BookingsApi,
} from '';
import type { UpdateBookingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookingsApi(config);

  const body = {
    // string
    bookingId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // BookingUpdateIn
    bookingUpdateIn: ...,
  } satisfies UpdateBookingRequest;

  try {
    const data = await api.updateBooking(body);
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
| **bookingId** | `string` |  | [Defaults to `undefined`] |
| **bookingUpdateIn** | [BookingUpdateIn](BookingUpdateIn.md) |  | |

### Return type

[**BookingOut**](BookingOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Booking updated |  -  |
| **403** | Not the booking owner |  -  |
| **404** | Booking not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateBookingFully

> BookingOut updateBookingFully(bookingId, bookingUpdateIn)

Update booking fully (admin)

### Example

```ts
import {
  Configuration,
  BookingsApi,
} from '';
import type { UpdateBookingFullyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new BookingsApi(config);

  const body = {
    // string
    bookingId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // BookingUpdateIn
    bookingUpdateIn: ...,
  } satisfies UpdateBookingFullyRequest;

  try {
    const data = await api.updateBookingFully(body);
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
| **bookingId** | `string` |  | [Defaults to `undefined`] |
| **bookingUpdateIn** | [BookingUpdateIn](BookingUpdateIn.md) |  | |

### Return type

[**BookingOut**](BookingOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Booking updated |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Booking not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

