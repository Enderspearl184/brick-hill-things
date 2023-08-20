const debugOutput=true
const sockets={}
var socketId=0
const port=42486
const maxHeartBeat=30

const SmartBuffer = require('smart-buffer').SmartBuffer
const net=require('net')
const http=require('http')
const zlib = require('zlib')
const fs = require('fs')
const phin = require('phin').defaults({
	parse:"json",
	timeout:15000
})

var myIp = ""

async function getIP(){
	try {
		let res = await phin("http://ip-api.com/json/")
		myIp = res.body.query
	} catch(err) {
		//who cares
	}
}
getIP()

setInterval(getIP,600000)
//finished:
// everything!!!

function readUIntV(buffer) {
    // 1 Byte
    if (buffer[0] & 1) {
        return {
            messageSize: buffer[0] >> 1,
            end: 1
        };
        // 2 Bytes
    }
    else if (buffer[0] & 2) {
        return {
            messageSize: (buffer.readUInt16LE(0) >> 2) + 0x80,
            end: 2
        };
        // 3 Bytes
    }
    else if (buffer[0] & 4) {
        return {
            messageSize: (buffer[2] << 13) + (buffer[1] << 5) + (buffer[0] >> 3) + 0x4080,
            end: 3
        };
        // 4 Bytes
    }
    else {
        return {
            messageSize: (buffer.readUInt32LE(0) / 8) + 0x204080,
            end: 4
        };
    }
}
function writeUIntV(buffer) {
    const length = buffer.length;
    // 1 Byte
    if (length < 0x80) {
        const size = Buffer.alloc(1);
        size.writeUInt8((length << 1) + 1);
        return Buffer.concat([size, buffer]);
        // 2 Bytes
    }
    else if (length < 0x4080) {
        const size = Buffer.alloc(2);
        size.writeUInt16LE(((length - 0x80) << 2) + 2);
        return Buffer.concat([size, buffer]);
        // 3 Bytes
    }
    else if (length < 0x204080) {
        const size = Buffer.alloc(3);
        const writeValue = ((length - 0x4080) << 3) + 4;
        size.writeUInt8((writeValue & 0xFF));
        size.writeUInt16LE(writeValue >> 8, 1);
        return Buffer.concat([size, buffer]);
        // 4 Bytes
    }
    else {
        const size = Buffer.alloc(4);
        size.writeUInt32LE((length - 0x204080) * 8);
        return Buffer.concat([size, buffer]);
    }
}

async function clientSendAuthentication(socket,authToken,clientId) {
	try {
		let packet=new SmartBuffer()
		packet.writeUInt8(0x01)
		packet.writeStringNT(authToken)
		packet.writeStringNT('0.3.1.0')
		packet.writeUInt8(clientId)
		packet=SmartBuffer.fromBuffer(writeUIntV(packet.toBuffer()))
		await socket.write(packet.toBuffer())
	} catch (err) {
        console.warn(err)
	}
	
}
async function clientSendHeartBeat(socket) {
	try {
		let packet=new SmartBuffer()
		packet.writeUInt8(0x12)
		packet=SmartBuffer.fromBuffer(writeUIntV(packet.toBuffer()))
		await socket.write(packet.toBuffer())
	} catch (err) {
        console.warn(err)
	}
}

async function clientSendCommand(socket,command,args) {
	try {
		let packet=new SmartBuffer()
		packet.writeUInt8(0x03)
		packet.writeStringNT(command)
		packet.writeStringNT(args)
		packet=SmartBuffer.fromBuffer(writeUIntV(packet.toBuffer()))
		await socket.write(packet.toBuffer())
	} catch (err) {
        console.warn(err)
	}
}

async function clientSendMove(socket,x,y,z,zrot,xrot) {
	try {
		let packet=new SmartBuffer()
		packet.writeUInt8(0x02)
		packet.writeFloatLE(x)
		packet.writeFloatLE(y)
		packet.writeFloatLE(z)
		packet.writeFloatLE(zrot)
		packet.writeFloatLE(xrot)
		packet=SmartBuffer.fromBuffer(writeUIntV(packet.toBuffer()))
		await socket.write(packet.toBuffer())
	} catch (err) {
        console.warn(err)
	}
}

async function clientSendBrickClick(socket,brickId) {
	try {
		let packet=new SmartBuffer()
		packet.writeUInt8(0x05)
		packet.writeUInt32LE(brickId)
		packet=SmartBuffer.fromBuffer(writeUIntV(packet.toBuffer()))
		await socket.write(packet.toBuffer())
	} catch (err) {
        console.warn(err)
	}
}

async function clientSendKeyPress(socket,key) {
	try {
		let packet=new SmartBuffer()
		packet.writeUInt8(0x06)
		if (key==='mouse') {
			packet.writeUInt8(1)
		} else {
			packet.writeUInt8(0)
			packet.writeStringNT(key)
		}
		packet=SmartBuffer.fromBuffer(writeUIntV(packet.toBuffer())) //whatever it works so i'm using it
		await socket.write(packet.toBuffer())
	} catch (err) {
        console.warn(err)
	}
}

function BGRtoRGB(bgr) {
  const len=bgr.length
    if (len<6) {
      for (i=1;i<=6-len;i++) {
        bgr=`0${bgr}`
      }
    }
    return `${bgr.substring(4, 6)}${bgr.substring(2, 4)}${bgr.substring(0, 2)}`;
}

async function serverLoadBrickPacket(socket,reader) {
	let packetObj={
		type:'loadbricks',
		data:{
			bricks:[]
		}
	}
	let count=reader.readUInt32LE()
	for (let i = 0; i < count; i++) {
		let brickObj={
			netId:reader.readUInt32LE(),
			collision:true,
			position:{
				x:reader.readFloatLE(),
				z:reader.readFloatLE(),
				y:reader.readFloatLE()
			},
			scale:{
				x:reader.readFloatLE(),
				z:reader.readFloatLE(),
				y:reader.readFloatLE()
			},
			color:BGRtoRGB(reader.readUInt32LE().toString(16)),
			visibility:reader.readFloatLE()
		}
		let attributes;
		try {
			attributes=reader.readStringNT()
		} catch (err) {}
    let hasModel=false
		if (attributes) {
			for (let i = 0; i < attributes.length; i++) {
				const ID = attributes.charAt(i);
				switch (ID) {
					case "A":
						brickObj.rotation=reader.readInt32LE();
						break;
					case "B":
						brickObj.shape=reader.readStringNT();
						break;
					case "C":
            hasModel=true
						break;
        	case "F":
						brickObj.collision=false;
						break;
					case "D": //light
						reader.readUInt32LE()
						reader.readUInt32LE()
						break;
					case "G":
						brickObj.clickable=Boolean(reader.readUInt8())
						brickObj.clickDistance=reader.readUInt32LE()
						break;
				}
			}
		}
    if (hasModel) {
      reader.readStringNT()
      reader.readStringNT()
	  brickObj.hasModel=true
    }
		packetObj.data.bricks.push(brickObj)
	}
	socket.queue.push(packetObj)
}

async function serverPlayerModificationPacket(socket,reader){
	//TweakDisableLighting
	//TweakDisableFigureCulling
	//Ambient
	//BaseCol
	//Sky
	//BaseSize
	//Sun
	//WeatherSun
	//WeatherRain
	//WeatherSnow
	//kick
	//prompt
  //RBLXSetShiftLockEnabled
  //RBLXLightingTechnology
  //RBLXSetShadowsEnabled
  //RBLXSetSunRaysEnabled
	let action=reader.readStringNT()
	switch (action) {
		case 'BaseCol':{
			let packetObj={
				type:'basecolor',
				data:{
					color:BGRtoRGB(reader.readUInt32LE().toString(16))
				}
			}
			socket.queue.push(packetObj)
			break
		} 
		case 'BaseSize':{
			let packetObj={
				type:'basesize',
				data:{
					size:reader.readUInt32LE()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 'topPrint':{
			let packetObj={
				type:'topprint',
				data:{
					text:reader.readStringNT(),
					seconds:reader.readUInt32LE()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 'centerPrint':{
			let packetObj={
				type:'centerprint',
				data:{
					text:reader.readStringNT(),
					seconds:reader.readUInt32LE()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 'bottomPrint':{
			let packetObj={
				type:'bottomprint',
				data:{
					text:reader.readStringNT(),
					seconds:reader.readUInt32LE()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 'prompt':{
			let packetObj={
				type:'prompt',
				data:{
					text:reader.readStringNT()
				}
			}
			socket.queue.push(packetObj)
			break
		}
    case 'RBLXSetShiftLockEnabled':{
      let packetObj={
        type:'setshiftlockenabled',
        data:{
          enabled:Boolean(reader.readUInt8())
        }
      }
      socket.queue.push(packetObj)
      break
    }
    case 'RBLXLightingTechnology':{
      let packetObj={
        type:'setlightingtechnology',
        data:{
          technology:reader.readStringNT()
        }
      }
      socket.queue.push(packetObj)
      break
    }
    case 'RBLXSetShadowsEnabled':{
      let packetObj={
        type:'setshadowsenabled',
        data:{
          enabled:Boolean(reader.readUInt8())
        }
      }
      socket.queue.push(packetObj)
      break
    }
    case 'RBLXSetSunRaysEnabled':{
      let packetObj={
        type:'setsunraysenabled',
        data:{
          enabled:Boolean(reader.readUInt8())
        }
      }
      socket.queue.push(packetObj)
      break
    }
    case 'Ambient':{
      let packetObj={
        type:'ambient',
        data:{
          ambient:BGRtoRGB(reader.readUInt32LE().toString(16))
        }
      }
      socket.queue.push(packetObj)
      break
    }
    case 'Sky':{
      let packetObj={
        type:'skycolor',
        data:{
          color:BGRtoRGB(reader.readUInt32LE().toString(16))
        }
      }
      socket.queue.push(packetObj)
      break
    }
    case 'kick':{
      let packetObj={
        type:'kick',
        data:{
          text:reader.readStringNT()
        }
      }
      socket.lastPacket=packetObj
      break
    }
	}
}

async function serverFigurePacket(socket,reader) {
  let actionstr=reader.readStringNT()
	let packetObj={
		type:'figure',
		data:{
			netId:reader.readUInt32LE(),
			actions:{

			}
		}
	}
	let actions=packetObj.data.actions
	for (let i=0;i<actionstr.length;i++) {
		switch (actionstr.charAt(i)) {
			case 'A':{ //position x
				if (!actions.position) actions.position={}
				actions.position.x=reader.readFloatLE()
				break
			}
			case 'B':{ //position z
				if (!actions.position) actions.position={}
				actions.position.z=reader.readFloatLE()
				break
			}
			case 'C':{ //position y
				if (!actions.position) actions.position={}
				actions.position.y=reader.readFloatLE()
				break
			}
			case "D": { //rotation x
        if (!actions.rotation) actions.rotation={}
        actions.rotation.x=reader.readFloatLE()
        break;
      }
      case "E": { //rotation z
        if (!actions.rotation) actions.rotation={}
        actions.rotation.z=reader.readFloatLE()
        break;
      }
      case "F": { //rotation y
        if (!actions.rotation) actions.rotation={}
        actions.rotation.y=reader.readFloatLE()
        break;
      }
			case "G": { //scale x
        if (!actions.scale) actions.scale={}
				actions.scale.x=reader.readFloatLE()
        break;
      }
			case "H": { //scale z
        if (!actions.scale) actions.scale={}
				actions.scale.z=reader.readFloatLE()
        break;
      }
			case "I": { //scale y
        if (!actions.scale) actions.scale={}
				actions.scale.y=reader.readFloatLE()
        break;
      }
			case "J": { //toolEquipped
				actions.toolEquipped=reader.readUInt32LE()
        socket.toolEquipped=true
        break;
      } //BGRtoRGB(reader.readUInt32LE().toString(16))
			case 'K': { //head color
				if (!actions.color) actions.color={}
				actions.color.head=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'L': { //torso color
				if (!actions.color) actions.color={}
				actions.color.torso=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'M': { //leftArm color
				if (!actions.color) actions.color={}
				actions.color.leftArm=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'N': { //rightArm color
				if (!actions.color) actions.color={}
				actions.color.rightArm=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'O': { //leftLeg color
				if (!actions.color) actions.color={}
				actions.color.leftLeg=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'P': { //rightLeg color
				if (!actions.color) actions.color={}
				actions.color.rightLeg=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case "Q": { //assets :/ UNIMPLEMENTED
        reader.readStringNT()
        break;
      }
			case "R": {
        reader.readStringNT()
        break;
      }
			case "S": {
        reader.readStringNT()
        break;
      }
			case "T": {
        reader.readStringNT()
        break;
      }
			case "U": {
          if (reader.readStringNT()!=="none") reader.readStringNT()
          break;
      }
			case "V": {
        if (reader.readStringNT()!=="none") reader.readStringNT()
        break;
      }
			case "W": {
        if (reader.readStringNT()!=="none") reader.readStringNT()
        break;
        }
			case 'X': { //score
				actions.score=reader.readInt32LE()
				break
			}
			case 'Y': {//team netid
				actions.team=reader.readUInt32LE()
				break
			}
			case '1':{//speed
				actions.speed=reader.readUInt32LE()
				break
			}
			case '2':{ //jumpPower
				actions.jumpPower=reader.readUInt32LE()
				break
			}
			case '3':{ //camera fov UNIMPLEMENTED
				actions.camerafov=reader.readUInt32LE()
				break
			}
			case '4': { //camera distance UNIMPLEMENTED
				actions.cameradistance=reader.readInt32LE()
				break
			}
			case '5': { //camera positions
				if (!actions.camerapos) actions.camerapos={}
				actions.camerapos.x=reader.readFloatLE()
				break
			}
			case '6': {
				if (!actions.camerapos) actions.camerapos={}
				actions.camerapos.z=reader.readFloatLE()
				break
			}
			case '7': {
				if (!actions.camerapos) actions.camerapos={}
				actions.camerapos.y=reader.readFloatLE()
				break
			}
			case '8': { //camera rotations UNIMPLEMENTED
        if (!actions.camerarot) actions.camerarot={}
				actions.camerarot.x=reader.readFloatLE()
				break
			}
			case '9': {
        if (!actions.camerarot) actions.camerarot={}
				actions.camerarot.z=reader.readFloatLE()
				break
			}
			case 'a': {
        if (!actions.camerarot) actions.camerarot={}
				actions.camerarot.y=reader.readFloatLE()
				break
			}
			case 'b': { //camera type UNIMPLEMENTED
				actions.cameratype=reader.readStringNT()
				break
			}
			case 'c': { //camera object UNIMPLEMENTED
				actions.cameraobject=reader.readUInt32LE()
				break
			}
			case 'e': { //helth
				actions.health=reader.readFloatLE()
				break
			}
			case 'f': { //player speech
				actions.speech=reader.readStringNT()
				break
			}
			case 'g': { //tool equipped and model (model unimplemented)
        try {
          actions.toolEquipped=reader.readUInt32LE()
          if (reader.readStringNT()!="none") {
            reader.readStringNT()
          }
        } catch (err) {}
				break
			}
    	case 'h': { //unequip tool
				actions.toolEquipped=0
				break
			}
		}
	}
	socket.queue.push(packetObj)
}

async function serverBotPacket(socket,reader) {
  let actionstr=reader.readStringNT()
	let packetObj={
		type:'bot',
		data:{
			netId:reader.readUInt32LE(),
			actions:{

			}
		}
	}
	let actions=packetObj.data.actions
	for (let i=0;i<actionstr.length;i++) {
		switch (actionstr.charAt(i)) {
			case 'A':{ //bot name
				actions.name=reader.readStringNT()
				break
			}
			case 'B':{ //position x
				if (!actions.position) actions.position={}
				actions.position.x=reader.readFloatLE()
				break
			}
			case 'C':{ //position z
				if (!actions.position) actions.position={}
				actions.position.z=reader.readFloatLE()
				break
			}
			case 'D':{ //position y
				if (!actions.position) actions.position={}
				actions.position.y=reader.readFloatLE()
				break
			}
			case "E": { //rotation x
                if (!actions.rotation) actions.rotation={}
				actions.rotation.x=reader.readFloatLE()
                break;
            }
            case "F": { //rotation z
                if (!actions.rotation) actions.rotation={}
				actions.rotation.z=reader.readFloatLE()
                break;
            }
            case "G": { //rotation y
                if (!actions.rotation) actions.rotation={}
				actions.rotation.y=reader.readFloatLE()
                break;
            }
			case "H": { //scale x
                if (!actions.scale) actions.scale={}
				actions.scale.x=reader.readFloatLE()
                break;
            }
			case "I": { //scale z
                if (!actions.scale) actions.scale={}
				actions.scale.z=reader.readFloatLE()
                break;
            }
			case "J": { //scale y
                if (!actions.scale) actions.scale={}
				actions.scale.y=reader.readFloatLE()
                break;
            }
			case 'K': { //head color
				if (!actions.color) actions.color={}
				actions.color.head=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'L': { //torso color
				if (!actions.color) actions.color={}
				actions.color.torso=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'M': { //leftArm color
				if (!actions.color) actions.color={}
				actions.color.leftArm=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'N': { //rightArm color
				if (!actions.color) actions.color={}
				actions.color.rightArm=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'O': { //leftLeg color
				if (!actions.color) actions.color={}
				actions.color.leftLeg=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case 'P': { //rightLeg color
				if (!actions.color) actions.color={}
				actions.color.rightLeg=BGRtoRGB(reader.readUInt32LE().toString(16))
				break
			}
			case "Q": { //assets :/ UNIMPLEMENTED
                reader.readStringNT()
                break;
            }
			case "R": {
                reader.readStringNT()
                break;
            }
			case "S": {
                reader.readStringNT()
                break;
            }
			case "T": {
                reader.readStringNT()
                break;
            }
			case "U": {
                if (reader.readStringNT()!=="none") reader.readStringNT()
                break;
            }
			case "V": {
                if (reader.readStringNT()!=="none") reader.readStringNT()
                break;
            }
			case "W": {
                if (reader.readStringNT()!=="none") reader.readStringNT()
                break;
            }
			case 'X': { //bot speech
				actions.speech=reader.readStringNT()
				break
			}
		}
	}
	socket.queue.push(packetObj)
}

async function serverBrickPacket(socket,reader){
	let packetObj={
		type:'brick',
		data:{
			netId:reader.readUInt32LE(),
			action:reader.readStringNT()
		}
	}
	switch (packetObj.data.action) {
		case 'pos':{
			packetObj.data.x=reader.readFloatLE()
			packetObj.data.z=reader.readFloatLE()
			packetObj.data.y=reader.readFloatLE()
			socket.queue.push(packetObj)
			break
		}
		case 'rot':{
			packetObj.data.rotation=reader.readUInt32LE()
			socket.queue.push(packetObj)
			break
		}
		case 'scale':{
			packetObj.data.x=reader.readFloatLE()
			packetObj.data.z=reader.readFloatLE()
			packetObj.data.y=reader.readFloatLE()
			socket.queue.push(packetObj)
			break
		}
		case 'kill':{ //for fun i'm making the brick kill packet actually work on the roblox game
			socket.queue.push(packetObj)
			break
		}
		case 'destroy':{
			packetObj={
				type:'deletebricks',
				data:{
					bricks:[packetObj.data.netId]
				}
			}
			socket.queue.push(packetObj)
      break
		}
		case 'col':{
			packetObj.data.color=BGRtoRGB(reader.readUInt32LE().toString(16))
			socket.queue.push(packetObj)
			break
		}
		case 'model':{
      if (reader.readStringNT()!=="none") reader.readStringNT()
			break
		}
		case 'alpha':{
			packetObj.data.visibility=reader.readFloatLE()
			socket.queue.push(packetObj)
			break
		}
		case 'collide':{
			packetObj.data.collision=Boolean(reader.readUInt8())
			socket.queue.push(packetObj)
			break
		}
		case 'lightcol':{
			reader.readUInt32LE()
			break
		}
		case 'lightrange':{
			reader.readUInt32LE()
			break
		}
		case 'clickable':{
			packetObj.data.clickable=Boolean(reader.readUInt8())
			packetObj.data.clickDistance=reader.readUInt32LE()
			socket.queue.push(packetObj)
			break
		}
	}
}

async function handlePacketType(type,socket, reader){
	switch (type) {
		case 1: { //authentication packet
			let packetObj={
				type:'authentication',
				data:{
					netId:reader.readUInt32LE(),
					brickCount:reader.readUInt32LE(), //brick count we ignore this
					userId:reader.readUInt32LE(),
					username:reader.readStringNT(),
					admin:Boolean(reader.readUInt8()),
					membershipType:reader.readUInt8(),
					gameId:reader.readUInt32LE(),
					name:(reader.readStringNT() || "")
				}
			}
			socket.queue.push(packetObj)
			break;
		}
		case 3: { //sendPlayers packet oooooooh array!!!!
			let packetObj={
				type:'sendplayers',
				data:{
					players:[]
				}
			}
			let count=reader.readUInt8()
			for (let i = 0; i < count; i++) {
				let playerObj={
					netId:reader.readUInt32LE(),
					username:reader.readStringNT(),
					userId:reader.readUInt32LE(),
					admin:Boolean(reader.readUInt8()),
					membershipType:reader.readUInt8()
				}
				packetObj.data.players.push(playerObj)
			}
			socket.queue.push(packetObj)
			break
		}
		case 4:{ //Figure packet UGHHHHHHHHHHH
			serverFigurePacket(socket,reader)
			break
		}
		case 5:{//removePlayer packet
			packetObj={
				type:'removeplayer',
				data:{
					netId:reader.readUInt32LE()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 6: { //Chat packet
			packetObj={
				type:'chat',
				data:{
					message:reader.readStringNT()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 7: { //PlayerModification packet UGHHHHHHHHHHHHHHH
			serverPlayerModificationPacket(socket,reader)
			break
		}
		case 8: { //Kill packet
			packetObj={
				type:'kill',
				data:{
					netId:reader.readUInt32LE(),
					dead:Boolean(reader.readUInt8())
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 9: { //Brick packet ewwwww
			serverBrickPacket(socket,reader)
			break
		}
		case 10: { //Team packet
			let packetObj={
				type:'team',
				data:{
					netId:reader.readUInt32LE(),
					name:reader.readStringNT(),
					color:BGRtoRGB(reader.readUInt32LE().toString(16))
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 11:{ //tool packet!
			let packetObj={
				type:'tool',
				data:{
					action:(reader.readUInt8() ? 'create' : 'destroy'),
					slotId:reader.readUInt32LE(),
					name:reader.readStringNT(),
					//model:reader.readStringNT()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 12:{ //bot packet ewwwwwwwwwww
			serverBotPacket(socket,reader)
			break
		}
		case 14:{ //clearmap packet lmao
			let packetObj={
				type:'clearmap'
			}
			socket.queue.push(packetObj)
			break
		}
		case 15:{ //DestroyBot packet
			let packetObj={
				type:'destroybot',
				data:{
					netId:reader.readUInt32LE()
				}
			}
			socket.queue.push(packetObj)
			break
		}
		case 16:{ //deletebricks
			let packetObj={
				type:'deletebricks',
				data:{
					bricks:[]
				}
			}
			let count=reader.readUInt32LE()
			for (let i = 0; i < count; i++) {
				packetObj.data.bricks.push(reader.readUInt32LE())
			}
			socket.queue.push(packetObj)
			break
		}
		case 17:{ //loadbricks
			serverLoadBrickPacket(socket,reader)
			break
		}
    default:{
      console.log("Unknown Packet: " + type)
    }
	}
}

async function packetHandler(socket,rawBuffer) {
  const packets = [];
  const weirdPackets=[]
  if (rawBuffer.length <= 1)
      return;
  await (async function readMessages(buffer) {
      const { messageSize, end } = readUIntV(buffer);
      if (messageSize >= buffer.length) {
          weirdPackets.push(buffer)
          return;
      }
      const packet = buffer.slice(end);
      packets.push(packet.slice(0, messageSize));
      if (packet.length > messageSize)
          return readMessages(packet.slice(messageSize));
  })(rawBuffer);
  if (weirdPackets.length) {
    socket.chunk=Buffer.concat(weirdPackets)
  } else {
    socket.chunk=undefined
  }
  for (let packet of packets) {
      // Uncompress the packet if it is compressed.
      try {
          packet = zlib.inflateSync(packet);
      }
      catch (err) { }
      const reader = SmartBuffer.fromBuffer(packet);
      // Check for the packet type
      let type;
      try {
          type = reader.readUInt8();
      }
      catch (err) { }
      // Packet type was invalid
      if (!type)
          return;
      handlePacketType(type,socket, reader);
  };
}

async function createSocket(port,host,auth,clientId) {
	if (clientId===undefined) {
		clientId=3
	}
	socketId++
	let socket=net.createConnection(port, host, async () => { //create the socket, and run stuff as the connected 
		await clientSendAuthentication(socket, auth,clientId) //we need to send auth or the node-hill sever gets very ANGY
		async function heartBeatLoop() { //heartbeat loop :)
			if (socket.writable) {
				await clientSendHeartBeat(socket)
				setTimeout(heartBeatLoop, 15000)
			}
		}
		heartBeatLoop()
		socket.heartBeatTime=maxHeartBeat
		let heartBeatTimer=setInterval(async()=>{
			socket.heartBeatTime--
			if (socket.heartBeatTime==0 || !socket.writable) {
				clearInterval(heartBeatTimer)
				try {
          delete sockets[socket.id]
					socket.destroy()
				} catch (err) {
					//who cares!
				}
			}
		},1000)
	})
	sockets[socketId]=socket
	socket.id=socketId
	console.log('Connected Socket ' + socket.id)
	socket.queue=[]

	socket.on('error', async(err)=>{
		//who cares!!! well i do if im debugging but yeah..
		if (debugOutput) {
			console.warn(err)
		}
	})
	socket.on('close',async()=>{
		if (!socket.lastPacket) {
		  socket.lastPacket={
        type:'kick',
        data:{
          text:'Connection Lost.'
        }
      }
    }
		console.log('Destroyed Socket ' + socket.id)
	})
  socket.chunk=undefined
	socket.on('data',async(rawBuffer)=>{
    if (!socket.chunk) {
      socket.chunk=rawBuffer
    } else {
      socket.chunk=Buffer.concat([socket.chunk,rawBuffer])
    }
    packetHandler(socket,socket.chunk)
  })
	return socket.id
}

async function handleCreateSocket(req,res,body) {
	let json;
	let ip;
	try {
		json=JSON.parse(body)
		ip=Buffer.from(json.ip.split("").reverse().join(""),'base64').toString()
	} catch(err) {
		res.writeHead(400)
		res.end('{"status":"badRequest"}')
		return
	}	
	if (ip==myIp) 
		ip = "127.0.0.1" //incase of localhost
	let socketid= await createSocket(json.port,ip,json.token,json.clientId)
	res.writeHead('200')
	res.end(JSON.stringify({status:'success',socket:socketid}))
	return
}

async function handleSocket(req,res,body) {
	let socketid=req.url.split('/sockets/')[1]
	if (sockets[socketid]) {
    if (sockets[socketid].lastPacket) {
      res.writeHead(200)
      res.end(JSON.stringify({
        queue:[sockets[socketid].lastPacket]
      }))
      return delete sockets[socketid]
    }
		let jsonPackets=JSON.stringify({queue:sockets[socketid].queue,status:"ok"})
  	sockets[socketid].queue=[]
		try {
			//handle packets!!
			json=JSON.parse(body)
			for (let packet of json.packets){
				switch (packet.type) {
					case 'close': {
						sockets[socketid].destroy()
						res.writeHead(404)
						res.end('{"status":"notFound"}')
						return
					}
					case 'move': {
						let x=packet.data.x
						let y=packet.data.y
						let z=packet.data.z
						let zrot=packet.data.zrot
						clientSendMove(sockets[socketid],x,y,z,zrot,0)
						sockets[socketid].heartBeatTime=maxHeartBeat
						break
					}
					case 'command': {
						clientSendCommand(sockets[socketid],packet.data.command,packet.data.args)
						sockets[socketid].heartBeatTime=maxHeartBeat
						break
					}
					case 'keypress': {
						clientSendKeyPress(sockets[socketid],packet.data.key)
						sockets[socketid].heartBeatTime=maxHeartBeat
						break
					}
					case 'brickclick': {
						clientSendBrickClick(sockets[socketid],packet.data.brickId)
						sockets[socketid].heartBeatTime=maxHeartBeat
						break
					}
					case 'heartbeat': {
						sockets[socketid].heartBeatTime=maxHeartBeat
						break
					}
				}
			}
	  	res.writeHead(200)
	  	res.end(jsonPackets)
		} catch (err) {
			console.error(err)
			res.writeHead(400)
			res.end('{"status":"badRequest"}')
		}
	} else {
		res.writeHead(404)
		res.end('{"status":"notFound"}')
	}
}

http.createServer(async function (req,res){
	if (req.method=='GET' && req.url=="/") {
		res.writeHead(200)
		res.end("OK")
		return
	}
  	if (req.url==!"/createSocket" && !req.url.startsWith('/sockets/')) {
		res.writeHead('404')
		res.end('{"status":"notFound", "message":"nope"}')
		return
	}
	if (req.method!=="POST") {
		res.writeHead('405');
		res.end('{"status":"methodNotAllowed", "message":"Use a POST request for the urls"}')
		return
	}
	let body='';
	req.on('data',(chunk)=> {
		body+=chunk.toString()
	})


	req.on('end', async()=>{
		if (req.url=="/createSocket") {
			handleCreateSocket(req,res,body)
		} else if (req.url.startsWith('/sockets/')) {
			handleSocket(req,res,body)
		}
	})
}).listen(port)