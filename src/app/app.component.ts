import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
@Injectable()
export class AppComponent implements OnInit {
  title = 'mailFront';
  response: any = '';
  formGroup: FormGroup;
  titleAlert = 'This field is required';
  post: any = '';

  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    const emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.formGroup = this.formBuilder.group({
      'email_from': [null, [Validators.required, Validators.pattern(emailregex)], this.checkInUseEmail],
      'password': [' '],
      'email_to': [null, [Validators.required, Validators.pattern(emailregex)], this.checkInUseEmail],
      'name': [' '],
      'description': [' '],
      'validate': '',
      'server': [' '],
      'port': [''],
      'subject': [' ']
    });
  }

  get name() {
    return this.formGroup.get('name') as FormControl;
  }

  checkPassword(control) {
    const enteredPassword = control.value;
    const passwordCheck = /^([a-z]+[0-9]+)|([0-9]+[a-z]+)/i;
    return (!passwordCheck.test(enteredPassword) && enteredPassword) ? { 'requirements': false } : null;
  }

  checkInUseEmail(control) {
    // mimic http database access
    const db = ['tony@gmail.com'];
    return new Observable(observer => {
      setTimeout(() => {
        const result = (db.indexOf(control.value) !== -1) ? { 'alreadyInUse': true } : null;
        observer.next(result);
        observer.complete();
      }, 4000);
    });
  }

  getErrorEmail() {
    return this.formGroup.get('email_to').hasError('required') ? 'Field is required' :
      this.formGroup.get('email_to').hasError('pattern') ? 'Not a valid emailaddress' :
        this.formGroup.get('email_to').hasError('alreadyInUse') ? 'This emailaddress is already in use' : '';
  }

  getErrorPassword() {
    return this.formGroup.get('password').hasError('required') ? 'Field is required (at least eight characters, one uppercase letter and one number)' :
      this.formGroup.get('password').hasError('requirements') ? 'Password needs to be at least eight characters, one uppercase letter and one number' : '';
  }

  onSubmit(post) {

    const headers = new HttpHeaders();
    headers.set('content-type', 'application/json');
    headers.set('Access-Control-Allow-Origin', '*');

    this.post = post;
    const sendPost = {};
    const port = +this.post.port;
    sendPost['request'] = {
      'content': this.post.description, 'to': this.post.email_to.trim(),
      'from': this.post.email_from.trim(), 'subject': this.post.subject
    };
    sendPost['settings'] = {
      'user': this.post.email_from.trim(), 'password': btoa(this.post.password).trim(),
      'server': this.post.server.trim(), 'port': port
    };

    let url = 'http://localhost:8888/basic';
    if (this.post.validate) {
      url = 'http://localhost:8888/premium';
    }

    this.http.post(url, sendPost, { 'headers': headers }).subscribe((data: any) => {
      if (data.data === 'ok') {
        alert('correo enviado');
        this.response = data;
      } else {
        alert('fallo envio');
      }
    });
  }
}
