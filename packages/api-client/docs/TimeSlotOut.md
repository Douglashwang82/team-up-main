
# TimeSlotOut


## Properties

Name | Type
------------ | -------------
`id` | string
`courtId` | string
`courtName` | string
`sportType` | string
`startsAt` | Date
`endsAt` | Date
`priceCents` | number
`currency` | string
`isBookable` | boolean

## Example

```typescript
import type { TimeSlotOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "courtId": null,
  "courtName": null,
  "sportType": null,
  "startsAt": null,
  "endsAt": null,
  "priceCents": null,
  "currency": TWD,
  "isBookable": null,
} satisfies TimeSlotOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TimeSlotOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


