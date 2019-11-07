import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Component} from 'react-simplified';
import {Alert} from '../widgets';
import {nyhetssakService} from '../services';
import {Navigation} from './staticComponents';
import {Sak} from './Sak';
import { createHashHistory } from 'history';

const history = createHashHistory();

let kategorier = ["Nyheter", "Sport", "Kultur", "Annet"];

export class EditSak extends Component<{ match: { params: { id: number, kategori: string } } }> {
  sak = null;

  render() {
    if (this.sak) {
      console.log(this.sak);
    return <>
    <Form>
  <Form.Group controlId="exampleForm.ControlInput1">
    <Form.Label>Overskrift</Form.Label>
    <Form.Control 
    type="text" 
    value={this.sak.overskrift}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.sak.overskrift = event.target.value)}
    />
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlTextarea1">
    <Form.Label>Innhold</Form.Label>
    <Form.Control as="textarea" rows="9"
    type="text" 
    value={this.sak.innhold}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.sak.innhold = event.target.value)}
    />
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlInput1">
    <Form.Label>Bilde</Form.Label>
    <Form.Control
    type="text" 
    value={this.sak.bilde}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.sak.bilde = event.target.value)}
    />
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlSelect2">
    <Form.Label>Kategori</Form.Label>
    <br></br>
    <select
    type="text"
    value={this.sak.kategori}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.sak.kategori = event.target.checked)}>
    {kategorier.map(kategori => (
      <option>{kategori}</option>
    ))}
    </select>
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlSelect2">
    <Form.Label>Viktighet</Form.Label>
    <br></br>
    <input
    type="checkbox"
    checked={this.sak.viktighet}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.sak.viktighet = event.target.checked)}
    />
  </Form.Group>
  <Button variant="success" onClick={this.save}>Endre nyhetsartikkel</Button>
</Form>
    </>
    }
    else {
      return (
        <div>Laster redigeringsskjema</div>
      )
    }
  }

  mounted() {
    nyhetssakService
      .getSakKatId(this.props.match.params.kategori, this.props.match.params.id)
      .then(sak => (this.sak = sak))
      .catch((error: Error) => Alert.danger(error.message));
  }

  save() {
    nyhetssakService
      .updateSak(this.props.match.params.id, this.sak.overskrift, this.sak.innhold, this.sak.bilde, this.sak.kategori, this.sak.viktighet)
      .then(() => {
        if (this.sak) {
          history.push("/");
          Alert.success("Saken er oppdatert!");
        }
      })
      .catch((error: Error) => Alert.danger(error.message));
  }
}

export class AddSak extends Component {
  overskrift = '';
  innhold = '';
  bilde = '';
  kategori = kategorier[0];
  viktighet = false;
  sak = null;
  inn_bruker = null;

  render() {
    return <>
    <Form>
  <Form.Group controlId="exampleForm.ControlInput1">
    <Form.Label>Overskrift</Form.Label>
    <Form.Control 
    type="text" 
    value={this.overskrift}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.overskrift = event.target.value)}
    />
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlTextarea1">
    <Form.Label>Innhold</Form.Label>
    <Form.Control as="textarea" rows="9"
    type="text" 
    value={this.innhold}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.innhold = event.target.value)}
    />
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlInput1">
    <Form.Label>Bilde</Form.Label>
    <Form.Control
    type="text" 
    value={this.bilde}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.bilde = event.target.value)}
    />
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlSelect2">
    <Form.Label>Kategori</Form.Label>
    <br></br>
    <select
    type="text"
    value={this.kategori}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.kategori = event.target.value)}>
    {kategorier.map(kategori => (
      <option>{kategori}</option>
    ))}
    </select>
  </Form.Group>
  <Form.Group controlId="exampleForm.ControlSelect2">
    <Form.Label>Viktighet</Form.Label>
    <br></br>
    <input
    type="checkbox"
    value={this.viktighet}
    onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.viktighet = event.target.checked)}
    cheked={this.viktighet}
    />
  </Form.Group>
  <Button variant="success" onClick={this.add}>Legg til nyhetsartikkel</Button>
</Form>
    </>
  }

  add() {
    nyhetssakService
      .postSak(this.overskrift, this.innhold, this.bilde, this.kategori, this.viktighet, this.inn_bruker.brukerId)
      .then(() => {
        history.push("/");
        Alert.success("Sak opprettet!");
      })
      .catch((error: Error) => Alert.danger(error.message));
  }

  mounted() {
    this.inn_bruker = Navigation.instance().inn_bruker;
  }
}