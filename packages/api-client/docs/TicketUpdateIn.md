
# TicketUpdateIn


## Properties

Name | Type
------------ | -------------
`date` | Date
`startTime` | string
`durationMinutes` | number
`sportType` | string
`intensity` | string
`venueIds` | Array&lt;string&gt;
`priceMin` | number
`priceMax` | number
`currency` | string

## Example

```typescript
import type { TicketUpdateIn } from ''

// TODO: Update the object below with actual values
const example = {
  "date": null,
  "startTime": null,
  "durationMinutes": null,
  "sportType": null,
  "intensity": null,
  "venueIds": null,
  "priceMin": null,
  "priceMax": null,
  "currency": null,
} satisfies TicketUpdateIn

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TicketUpdateIn
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


