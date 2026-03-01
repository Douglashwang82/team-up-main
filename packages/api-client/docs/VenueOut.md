
# VenueOut


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`address` | string
`city` | string
`latitude` | number
`longitude` | number
`distanceMeters` | number

## Example

```typescript
import type { VenueOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "address": null,
  "city": null,
  "latitude": null,
  "longitude": null,
  "distanceMeters": null,
} satisfies VenueOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as VenueOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


