
# VenueUpdateIn


## Properties

Name | Type
------------ | -------------
`name` | string
`address` | string
`city` | string
`latitude` | number
`longitude` | number
`contactPhone` | string
`partnerCode` | string

## Example

```typescript
import type { VenueUpdateIn } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "address": null,
  "city": null,
  "latitude": null,
  "longitude": null,
  "contactPhone": null,
  "partnerCode": null,
} satisfies VenueUpdateIn

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as VenueUpdateIn
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


