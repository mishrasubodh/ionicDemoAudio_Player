import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import * as jsmediatags from 'jsmediatags';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  _fileList: any[] = [];
  key: string = 'musicDB';
  player: any={};
  cursrc = '';
  index = 0;
  playIcon = 'play';
  range = 0;
  defaultImg = 'https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
  currentContext: any;
  showLoader=false;
  canvas:any;
  showSlider=false;
  constructor(public navCtrl: NavController, public platform: Platform, private storage: Storage,private file: File) {

    this.platform.ready().then(() => {
      this.storage.get('musicDB').then((data) => {

        if (data) {
          if(Array.isArray(data)){
            if(data.length){
              this._fileList = data;
            }
            else{
            
              this.getData();
            }
          }
          
        }
        else {
          
          this.getData();
        }
      },
        (error) => {
          console.log(error);
          this.getData();
        })
    })
  }

  getData(){ 
    this.showLoader=true;
    this.file.listDir(this.file.externalRootDirectory, '').then((result) => {
      for (let item of result) {
        if (item.isDirectory == true && item.name != '.' && item.name != '..') {
          this.getFileList(item.name);
        }
        else if (item.isFile == true) {
          if (item.name.indexOf('.mp3') != -1 && item.name.indexOf('AUD-') == -1 && item.name.indexOf('._') == -1) {

            jsmediatags.read(item.toInternalURL(), {
              onSuccess: (tags) => {
                var tags = tags.tags;
                var image = tags.picture;
                var base64 = '';
                if (image) {
                  var base64String = "";
                  for (var i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                  }
                  base64 = "data:image/jpeg;base64," + window.btoa(base64String);
                }
                if (base64) {
                  this._fileList.push({
                    name: item.name,
                    path: item.nativeURL,
                    fullPath: item.fullPath,
                    inturl: item.toInternalURL(),
                    image: base64
                  });
                }
                else {
                  this._fileList.push({
                    name: item.name,
                    path: item.nativeURL,
                    fullPath: item.fullPath,
                    inturl: item.toInternalURL(),
                    image: './assets/imgs/music.jpg'
                  });
                }
              },
              onError: (error) => {
                console.log(error);
                this._fileList.push({
                  name: item.name,
                  path: item.nativeURL,
                  fullPath: item.fullPath,
                  inturl: item.toInternalURL(),
                  image: './assets/imgs/music.jpg'
                });
              }
            });

          }  
        }
      }     
      this.showLoader=false;
    },
      (error) => {
        console.log(error);
      })
  }

  public getFileList(path: string): any { 
    let file = new File();
    this.showLoader=true;
    this.file.listDir(file.externalRootDirectory, path)
      .then((result) => {
        for (let item of result) {
          if (item.isDirectory == true && item.name != '.' && item.name != '..') {
            this.getFileList(path + '/' + item.name);
          }
          else if (item.isFile == true) {
            if (item.name.indexOf('.mp3') != -1 && item.name.indexOf('AUD-') == -1 && item.name.indexOf('._') == -1) {
              jsmediatags.read(item.toInternalURL(), {
                onSuccess: (tags) => {
                  var tags = tags.tags;
                  var image = tags.picture;
                  var base64 = '';
                  if (image) {
                    var base64String = "";
                    for (var i = 0; i < image.data.length; i++) {
                      base64String += String.fromCharCode(image.data[i]);
                    }
                    base64 = "data:image/jpeg;base64," + window.btoa(base64String);
                  }
                  if (base64) {
                    this._fileList.push({
                      name: item.name,
                      path: item.nativeURL,
                      fullPath: item.fullPath,
                      inturl: item.toInternalURL(),
                      image: base64
                    });
                  }
                  else {
                    this._fileList.push({
                      name: item.name,
                      path: item.nativeURL,
                      fullPath: item.fullPath,
                      inturl: item.toInternalURL(),
                      image: './assets/imgs/music.jpg'
                    });
                  }
                },
                onError: (error) => {
                  console.log(error);
                  this._fileList.push({
                    name: item.name,
                    path: item.nativeURL,
                    fullPath: item.fullPath,
                    inturl: item.toInternalURL(),
                    image: './assets/imgs/music.jpg'
                  });
                }
              });
            }
          }
        }
        this.showLoader=false;
        this.storage.set(this.key,this._fileList);
      }, (error) => {
        console.log(error);
      })

      
      
  }



  ionViewDidLoad() {
    this.player = document.getElementById('video');
    console.log(this.player , 'player')
    this.player.onended =  ()=>{
      console.log("on song end");
      this.songOnEnd();
     }
    if (this._fileList.length) {
      console.log('length' , this._fileList)
      this.player.setAttribute('src', this._fileList[this.index].path);
      console.log(this._fileList[this.index].path , 'this._fileList[this.index].path');
    }
  }

  songOnEnd(){
      this.range=0;
      if (this.index != this._fileList.length - 1) {
        this.index = this.index + 1;
      }
      else {
        this.index = 0;
      }
      this.player.setAttribute('src', this._fileList[this.index].path);

      this.player.play()
      this.currentContext = this._fileList[this.index];
  }


  play() {
    var src = this.player.src;
    if (src != 'file:///android_asset/www/index.html') {
      if (src && this.playIcon == 'play') {
        this.player.play();
        this.playIcon = 'pause';
      }
      else if (src && this.playIcon == 'pause') {
        this.player.pause();
        this.playIcon = 'play';
      }
      else {
        this.player.setAttribute('src', this._fileList[this.index].path);
      }
    }
    else {
      this.player.setAttribute('src', this._fileList[this.index].path);
      this.player.play();
      this.playIcon = 'pause';
    }
    console.log(this.updateProgressBar , 'updateprocess bar' )
    this.player.addEventListener('timeupdate', this.updateProgressBar, false);
    this.defaultImg = './assets/imgs/music.jpg';
    this.currentContext = this._fileList[this.index];
    console.log("filelist", this._fileList[this.index]);

  }

  back() {
    this.player.pause();
    if (this.index) {
      this.index = this.index - 1;
      this.player.setAttribute('src', this._fileList[this.index].path);
      this.range = 0;

    }
    this.player.play();
    this.currentContext = this._fileList[this.index];
  }

  front() {
    this.player.pause();
    if (this.index < this._fileList.length - 1) {
      this.index = this.index + 1;
      this.player.setAttribute('src', this._fileList[this.index].path);
      this.range = 0;
    }
    this.player.play();
    this.currentContext = this._fileList[this.index];
  }

  getCurrentSongName() {
    return this._fileList[this.index].name;
  }

  updateProgressBar() { 
    try {
      if (this.player) {
        const duration = this.player.duration;
        const percentage = Math.floor((100 / duration) * this.player.currentTime);
        this.range = percentage;
        if (!this.player.paused) {
          window.requestAnimationFrame(this.updateProgressBar);
        } else {
          window.cancelAnimationFrame(0);
        }
      }  
    } catch (error) {
      console.log(error);
    }
  }

  changeTime(event: any){
    const val = event.value;
    const tps = this.player.duration / 100;
    this.player.currentTime = Math.floor(val * tps);
  
  }

  getDuration(){
    if(this.player){
      if(this.player.duration){
        const time = this.player.duration;
        const int = Math.floor(time),
        mins = Math.floor(int / 60),
        secs = int % 60,
        newTime = mins + ':' + ('0' + secs).slice(-2);
        return newTime;
      }
      else{
        return '0:00'
      }
      
    }
    else{
      return '0:00';
    }
  }
  
  showVol(){
    this.showSlider=true;
  }
}
