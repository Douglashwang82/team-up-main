
# UserOut


## Properties

Name | Type
------------ | -------------
`id` | string
`email` | string
`displayName` | string
`createdAt` | Date
`updatedAt` | Date
`preferredSports` | Array&lt;string&gt;
`skillLevels` | { [key: string]: string; }
`preferredTimeSlots` | Array&lt;string&gt;
`preferredLanguage` | string
`customPreferences` | string

## Example

```typescript
import type { UserOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "email": null,
  "displayName": null,
  "createdAt": null,
  "updatedAt": null,
  "preferredSports": null,
  "skillLevels": null,
  "preferredTimeSlots": null,
  "preferredLanguage": null,
  "customPreferences": null,
} satisfies UserOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


