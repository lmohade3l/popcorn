import { useState , useEffect } from "react";

export function useLocalStorageState(initial_state , key) {
    const [value , set_value] = useState(function() {
    const stored_value = localStorage.getItem(key);
    return stored_value? JSON.parse(stored_value) : initial_state;
  });

    useEffect(function() {
        localStorage.setItem('key' ,JSON.stringify(value));
    } , [value , key]);

    return [value , set_value];
}