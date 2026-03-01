
# BookingDetailOut


## Properties

Name | Type
------------ | -------------
`id` | string
`ownerUserId` | string
`timeSlotId` | string
`eventId` | string
`status` | string
`paymentStatus` | string
`timeSlot` | [TimeSlotOut](TimeSlotOut.md)
`court` | [CourtOut](CourtOut.md)
`venue` | [VenueOut](VenueOut.md)
`event` | [EventOut](EventOut.md)
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { BookingDetailOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "ownerUserId": null,
  "timeSlotId": null,
  "eventId": null,
  "status": null,
  "paymentStatus": null,
  "timeSlot": null,
  "court": null,
  "venue": null,
  "event": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies BookingDetailOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BookingDetailOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


