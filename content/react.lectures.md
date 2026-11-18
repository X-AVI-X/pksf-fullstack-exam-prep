## Components and JSX
A React component is a function that takes props and returns elements. JSX looks like HTML but is JavaScript: {expressions} are evaluated, and className replaces class. Build the interface from small components, each with one job, and pass data down through props.

@check
Q: In JSX, how do you insert the value of a JavaScript variable named total into a paragraph?
- <p>total</p>
* <p>{total}</p>
- <p>${total}</p>
- <p class="total"></p>
E: Curly braces embed a JavaScript expression in JSX. Plain text would print the word itself.

## State and re-rendering
State is data that changes over time. useState returns the current value and a setter. Calling the setter schedules a re-render. Never mutate state directly: create a new value, such as a new array with the added item. React compares the new value and re-renders only when it changed.

@check
Q: Which update correctly adds an item to a list kept in state?
- items.push(newItem); setItems(items);
* setItems([...items, newItem]);
- items = [...items, newItem];
- setItems(newItem);
E: Mutating the array and passing the same reference does not signal a change. A new array triggers the re-render.

## Effects and dependencies
useEffect runs side effects after render, such as fetching data or subscribing to events. Its dependency array lists the values the effect uses. The effect runs again when one of them changes. Return a cleanup function to remove subscriptions or cancel requests when the component unmounts or before the effect runs again.

@check
Q: A useEffect with an empty dependency array runs how often?
- On every render
* Once after the first render, and cleanup runs when the component unmounts
- Never
- Only when the user clicks
E: An empty array means the effect depends on nothing, so it runs once on mount and its cleanup runs on unmount.

## Performance: memoisation and keys
React re-renders children when a parent re-renders. useMemo caches an expensive value, and React.memo skips re-rendering a child when its props have not changed. Lists need a stable key on each item, so React can match items correctly when the list changes. Avoid using the array index as a key when items can be reordered or removed.

@check
Q: Why should list items use a stable id rather than the array index as a key?
- Keys are not used in React
* Because when items are reordered or removed, an index-based key can match the wrong component state
- Because indices are always strings
- Because an index makes the list render slower by itself
E: React uses keys to match elements between renders. When the order changes, index keys attach old state to the wrong item.
