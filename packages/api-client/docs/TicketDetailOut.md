
# TicketDetailOut


## Properties

Name | Type
------------ | -------------
`id` | string
`date` | Date
`startTime` | string
`durationMinutes` | number
`sportType` | string
`intensity` | string
`venueIds` | Array&lt;string&gt;
`priceMin` | number
`priceMax` | number
`currency` | string
`status` | string
`createdAt` | Date
`matchedEvents` | [Array&lt;MatchedEventSummary&gt;](MatchedEventSummary.md)

## Example

```typescript
import type { TicketDetailOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "date": null,
  "startTime": null,
  "durationMinutes": null,
  "sportType": null,
  "intensity": null,
  "venueIds": null,
  "priceMin": null,
  "priceMax": null,
  "currency": null,
  "status": null,
  "createdAt": null,
  "matchedEvents": null,
} satisfies TicketDetailOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TicketDetailOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


