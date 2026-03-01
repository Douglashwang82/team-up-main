
# EventDetailOut


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`image` | string
`description` | string
`status` | string
`maxParticipants` | number
`currentParticipants` | number
`ownerUserId` | string
`visibility` | string
`durationType` | string
`participants` | [Array&lt;EventParticipantOut&gt;](EventParticipantOut.md)
`bookings` | [Array&lt;EventBookingDetail&gt;](EventBookingDetail.md)
`createdAt` | Date
`updatedAt` | Date
`userJoinStatus` | string

## Example

```typescript
import type { EventDetailOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "image": null,
  "description": null,
  "status": null,
  "maxParticipants": null,
  "currentParticipants": null,
  "ownerUserId": null,
  "visibility": null,
  "durationType": null,
  "participants": null,
  "bookings": null,
  "createdAt": null,
  "updatedAt": null,
  "userJoinStatus": null,
} satisfies EventDetailOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventDetailOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


