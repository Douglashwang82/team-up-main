# VenuesApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createTimeSlot**](VenuesApi.md#createtimeslot) | **POST** /venues/{venue_id}/courts/{court_id}/time_slots | Create new timeslot(s) |
| [**createVenue**](VenuesApi.md#createvenue) | **POST** /venues | Create venue |
| [**deleteCourt**](VenuesApi.md#deletecourt) | **DELETE** /venues/{venue_id}/courts/{court_id} | Delete court |
| [**deleteTimeSlot**](VenuesApi.md#deletetimeslot) | **DELETE** /venues/{venue_id}/courts/{court_id}/time_slots/{time_slot_id} | Delete timeslot |
| [**deleteVenue**](VenuesApi.md#deletevenue) | **DELETE** /venues/{venue_id} | Delete venue |
| [**getCourt**](VenuesApi.md#getcourt) | **GET** /venues/{venue_id}/courts/{court_id} | Get court detail |
| [**getCourtTimeSlots**](VenuesApi.md#getcourttimeslots) | **GET** /venues/{venue_id}/courts/{court_id}/time_slots | Get available time slots for a court |
| [**getTimeSlot**](VenuesApi.md#gettimeslot) | **GET** /venues/{venue_id}/courts/{court_id}/time_slots/{time_slot_id} | Get timeslot details |
| [**getVenueById**](VenuesApi.md#getvenuebyid) | **GET** /venues/{venue_id} | Get venue details |
| [**searchVenues**](VenuesApi.md#searchvenues) | **GET** /venues | Search venues with available time slots |
| [**updateCourt**](VenuesApi.md#updatecourt) | **PUT** /venues/{venue_id}/courts/{court_id} | Update court |
| [**updateTimeSlot**](VenuesApi.md#updatetimeslot) | **PUT** /venues/{venue_id}/courts/{court_id}/time_slots/{time_slot_id} | Update timeslot |
| [**updateVenue**](VenuesApi.md#updatevenue) | **PUT** /venues/{venue_id} | Update venue |



## createTimeSlot

> TimeSlotOut createTimeSlot(venueId, courtId, timeSlotCreateIn)

Create new timeslot(s)

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { CreateTimeSlotRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // TimeSlotCreateIn
    timeSlotCreateIn: ...,
  } satisfies CreateTimeSlotRequest;

  try {
    const data = await api.createTimeSlot(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |
| **timeSlotCreateIn** | [TimeSlotCreateIn](TimeSlotCreateIn.md) |  | |

### Return type

[**TimeSlotOut**](TimeSlotOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Time slot created |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Venue or court not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createVenue

> VenueDetail createVenue(venueCreateIn)

Create venue

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { CreateVenueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // VenueCreateIn
    venueCreateIn: ...,
  } satisfies CreateVenueRequest;

  try {
    const data = await api.createVenue(body);
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
| **venueCreateIn** | [VenueCreateIn](VenueCreateIn.md) |  | |

### Return type

[**VenueDetail**](VenueDetail.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Venue created |  -  |
| **400** | Invalid input |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteCourt

> DeleteAccount200Response deleteCourt(venueId, courtId)

Delete court

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { DeleteCourtRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteCourtRequest;

  try {
    const data = await api.deleteCourt(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Court deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Venue or court not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteTimeSlot

> DeleteAccount200Response deleteTimeSlot(venueId, courtId, timeSlotId)

Delete timeslot

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { DeleteTimeSlotRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    timeSlotId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteTimeSlotRequest;

  try {
    const data = await api.deleteTimeSlot(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |
| **timeSlotId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Time slot deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Time slot not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteVenue

> DeleteAccount200Response deleteVenue(venueId)

Delete venue

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { DeleteVenueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteVenueRequest;

  try {
    const data = await api.deleteVenue(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Venue deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Venue not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCourt

> CourtOut getCourt(venueId, courtId)

Get court detail

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { GetCourtRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new VenuesApi();

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetCourtRequest;

  try {
    const data = await api.getCourt(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**CourtOut**](CourtOut.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Court detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCourtTimeSlots

> Array&lt;TimeSlotOut&gt; getCourtTimeSlots(venueId, courtId, date)

Get available time slots for a court

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { GetCourtTimeSlotsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new VenuesApi();

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // Date | Filter by date (YYYY-MM-DD) (optional)
    date: Sun Oct 19 19:00:00 CDT 2025,
  } satisfies GetCourtTimeSlotsRequest;

  try {
    const data = await api.getCourtTimeSlots(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |
| **date** | `Date` | Filter by date (YYYY-MM-DD) | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;TimeSlotOut&gt;**](TimeSlotOut.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of available time slots |  -  |
| **404** | Venue or court not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTimeSlot

> TimeSlotOut getTimeSlot(venueId, courtId, timeSlotId)

Get timeslot details

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { GetTimeSlotRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new VenuesApi();

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    timeSlotId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetTimeSlotRequest;

  try {
    const data = await api.getTimeSlot(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |
| **timeSlotId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**TimeSlotOut**](TimeSlotOut.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Time slot details |  -  |
| **404** | Time slot not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getVenueById

> VenueDetail getVenueById(venueId)

Get venue details

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { GetVenueByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new VenuesApi();

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetVenueByIdRequest;

  try {
    const data = await api.getVenueById(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**VenueDetail**](VenueDetail.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Venue details |  -  |
| **404** | Venue not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## searchVenues

> Array&lt;VenueSearchResult&gt; searchVenues(lat, lng, distance, datetime, sportType, requireBookable)

Search venues with available time slots

Search venues based on location, datetime, and sport type. Supports geolocation-based search with distance filtering. 

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { SearchVenuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new VenuesApi();

  const body = {
    // number | Latitude coordinate (optional)
    lat: 25.033,
    // number | Longitude coordinate (optional)
    lng: 121.5654,
    // number | Search radius in meters (default 5000m) (optional)
    distance: 5000,
    // string | ISO datetime (YYYY-MM-DDTHH:MM:SS) or date (YYYY-MM-DD) (optional)
    datetime: 2025-10-20,
    // string | Filter by sport type (optional)
    sportType: basketball,
    // boolean | Only return venues with bookable time slots (default false) (optional)
    requireBookable: false,
  } satisfies SearchVenuesRequest;

  try {
    const data = await api.searchVenues(body);
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
| **lat** | `number` | Latitude coordinate | [Optional] [Defaults to `undefined`] |
| **lng** | `number` | Longitude coordinate | [Optional] [Defaults to `undefined`] |
| **distance** | `number` | Search radius in meters (default 5000m) | [Optional] [Defaults to `5000`] |
| **datetime** | `string` | ISO datetime (YYYY-MM-DDTHH:MM:SS) or date (YYYY-MM-DD) | [Optional] [Defaults to `undefined`] |
| **sportType** | `string` | Filter by sport type | [Optional] [Defaults to `undefined`] |
| **requireBookable** | `boolean` | Only return venues with bookable time slots (default false) | [Optional] [Defaults to `false`] |

### Return type

[**Array&lt;VenueSearchResult&gt;**](VenueSearchResult.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of venues with available time slots |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateCourt

> CourtOut updateCourt(venueId, courtId, courtUpdateIn)

Update court

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { UpdateCourtRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // CourtUpdateIn
    courtUpdateIn: ...,
  } satisfies UpdateCourtRequest;

  try {
    const data = await api.updateCourt(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |
| **courtUpdateIn** | [CourtUpdateIn](CourtUpdateIn.md) |  | |

### Return type

[**CourtOut**](CourtOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Court updated |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Venue or court not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateTimeSlot

> TimeSlotOut updateTimeSlot(venueId, courtId, timeSlotId, timeSlotUpdateIn)

Update timeslot

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { UpdateTimeSlotRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    courtId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string
    timeSlotId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // TimeSlotUpdateIn
    timeSlotUpdateIn: ...,
  } satisfies UpdateTimeSlotRequest;

  try {
    const data = await api.updateTimeSlot(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **courtId** | `string` |  | [Defaults to `undefined`] |
| **timeSlotId** | `string` |  | [Defaults to `undefined`] |
| **timeSlotUpdateIn** | [TimeSlotUpdateIn](TimeSlotUpdateIn.md) |  | |

### Return type

[**TimeSlotOut**](TimeSlotOut.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Time slot updated |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Time slot not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateVenue

> VenueDetail updateVenue(venueId, venueUpdateIn)

Update venue

### Example

```ts
import {
  Configuration,
  VenuesApi,
} from '';
import type { UpdateVenueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new VenuesApi(config);

  const body = {
    // string
    venueId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // VenueUpdateIn
    venueUpdateIn: ...,
  } satisfies UpdateVenueRequest;

  try {
    const data = await api.updateVenue(body);
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
| **venueId** | `string` |  | [Defaults to `undefined`] |
| **venueUpdateIn** | [VenueUpdateIn](VenueUpdateIn.md) |  | |

### Return type

[**VenueDetail**](VenueDetail.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Venue updated |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Venue not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

