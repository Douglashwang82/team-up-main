
# VenueDetail


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`address` | string
`city` | string
`latitude` | number
`longitude` | number
`contactPhone` | string
`partnerCode` | string
`courts` | [Array&lt;CourtOut&gt;](CourtOut.md)
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { VenueDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "address": null,
  "city": null,
  "latitude": null,
  "longitude": null,
  "contactPhone": null,
  "partnerCode": null,
  "courts": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies VenueDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as VenueDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


