# Async vs Sync Relationships

- Previous ← [Many To One Relationships](./4-one-to-many.md)
- Next → [Async Vs Sync](./6-async-vs-sync.md)
- ⮐ [Relationships Guide](../index.md)

---

## what it means to be "async" today

- the relationship may not be loaded yet
- the relationships will be a promise proxy
- the relationship will be fetched from the server when accessed if needed on access
- implies an async boundary in your data graph
  - in human language: relationship data requires a request to be fetched
- implies your API is designed with an async boundary in the data graph in this location
  - this means your API via either a derivable heuristic or explicitly in a previous request gives you enough information to make a secondary fetch for the related data on its own endpoint(s).
- if we have identifiers but no links, we fetch each individual record if that record is not loaded yet
- if we have identifiers and links, we fetch the related link if any of the identifiers are not loaded yet
- if we only have links, we fetch the related link
- if we have no identifiers and no links, we do nothing. Be careful because this can be very confusing if you are expecting a magical request. Best thing to do here is add a related link in your serializer or handler to the relationship payload for the relationship to use.

## what it means to be "sync" today

- you are pinky promising that the associated data is going to be fully available (no missing records at all, no error'd records at all) by the moment that relationship is first accessed.
- this is extremely risky IF the data is not guaranteed to be in the same payload as the parent record by your API

## In the future, async will mean

- there is an async boundary in your data graph
- your API has a unique endpoint with its own self link for the relationship
  - basically: no more fetch by type+id, only fetch by links
  - this will put the relationship into an automatically paginated mode
  - this will put the relationship into a document structured shape
  - sync relationships will not have a document structured shape
  - sync relationship will not be paginated

```ts
  const record = store.peekRecord('post', '1');

  // sync comments
  Array.isArray(record.comments); // true

  // async comments
  record.comments; // an object
  record.comments.fetch(); // fetch the related link
  Array.isArray(record.comments.data) // true
  record.comments.links;
  record.comments.meta;
  record.comments.next();
  record.comments.pages;
```

roughly speaking async: false vs async: true is going to be a determination around two things
(1) whether the relationship is paginated. Paginated relationships must always be async: true 
(2) whether the relationship has meta information / a self endpoint

basically, sync relationship (async: false) means:

- the related data is (always) included in the request
- the related data is (always) present in its entirety
- the related data is always updated/created/saved in the context of an "owner" model it is tightly coupled to

### from an API perspective the difference is this:

#### a sync relationship

```js
{
  data: {
    type: 'user',
    id: '1',
    relationships: {
      friends: {
        data: [{type: 'user', id: '2' }]
      }
    }
  },
  included: [
    {
      type: 'user',
      id: '2',
      relationships: {
        friends: {
          data: [{type: 'user', id: '1' }]
        }
      }
    }
  ]
}
```

#### an async relationship

```js
{
  data: {
    type: 'user',
    id: '1',
    relationships: {
      friends: {
        links: {
          self: '/user/1/relationships/friends',
          related: '/user/1/friends',
          // optionally "first" "last" "prev" "next"
        }
      }
    }
  }
}
```

From a UI perspective a sync relationship looks just like a sync relationship today - an array directly on the parent record, e.g. user.friends

An async relationship will look like this:

```js
// use all loaded friends
// this will be an immutable array of all pages combined
user.friends.data;

// access specific pages only
user.friends.pages.at(index);

// load the relationship
const page1 = await user.friends.fetch();

// load the next page of a specific page
await page.next();
// load the next page of the last page currently loaded
await user.friends.next();
```

With async relationships, if you then want to add to the relationship:

- you either have to add to a specific page OR
- you have to add to a special unknown page.

The special unknown page is basically a page that acts like your other pages, but contains records you've manually added to the relationship, that do not yet belong to any other page. This makes things like filters easy to achieve.

## Tips and tricks 

### Async that behaves like sync 

If you are async, but need sync access, you use a pattern similar to what future EmberData will do as well

```ts
@cached
get postComments() {
  const postCommentsReference = post.hasMany('comments');
  // value access is auto-tracked
  const postComments = postCommentsReference.value();

  if (postComments === null) {
    void postComments.load();
  } else {
    return postComments;
  }

  return [];
}
```

```ts
@cached
get postComments() {
  const postComments = post.comments;

  if (postComments.data === null) {
    void postComments.fetch();
  } else {
    return postComments.data;
  }

  return [];
}
```

```hbs
{{#await (fetch post.comments) as |comments|}}
  {{#each comments.data as |comment|}}
    {{comment.body}}
  {{/each}}
{{/await}}
```

### what if you want two different views of the same relationship at the same time?

```ts
// make it a resource
fiveStartComments = use(() => {
  const postComments = post.comments;

  const url = postComments.links.related;
  url += '?filter[stars]=5';

  const page1 = await postComments.fetch({ url });

  return page1;
})
```
