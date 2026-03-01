
# EventBookingDetail


## Properties

Name | Type
------------ | -------------
`id` | string
`status` | string
`paymentStatus` | string
`timeSlot` | [TimeSlotOut](TimeSlotOut.md)
`court` | [CourtOut](CourtOut.md)
`venue` | [VenueOut](VenueOut.md)
`createdAt` | Date

## Example

```typescript
import type { EventBookingDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "status": null,
  "paymentStatus": null,
  "timeSlot": null,
  "court": null,
  "venue": null,
  "createdAt": null,
} satisfies EventBookingDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventBookingDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


