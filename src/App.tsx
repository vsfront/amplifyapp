import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';
import API, { GraphQLResult, graphqlOperation } from '@aws-amplify/api'
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import * as APIt from './API'


const initialFormState = { name: '', description: '' }


function App() {
  const [notes, setNotes] = useState<APIt.Note[]>([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const b = apiData as GraphQLResult<APIt.ListNotesQuery>
    if (b?.data?.listNotes?.items) {
      setNotes(b.data.listNotes.items as APIt.Note[]);
    }
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([...notes, formData as APIt.Note]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }: { id: string }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } } });
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <h1>My Notes App</h1>
          <input
            onChange={e => setFormData({ ...formData, 'name': e.target.value })}
            placeholder="Note name"
            value={formData.name}
          />
          <input
            onChange={e => setFormData({ ...formData, 'description': e.target.value })}
            placeholder="Note description"
            value={formData.description}
          />
          <button onClick={createNote}>Create Note</button>
          <div style={{ marginBottom: 30 }}>
            {
              notes.map(note => (
                <div key={note.id || note.name}>
                  <h2>{note.name}</h2>
                  <p>{note.description}</p>
                  <button onClick={() => deleteNote(note)}>Delete note!</button>
                </div>
              ))
            }
          </div>
          <div>
            <button onClick={signOut}>Sign out</button>
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
