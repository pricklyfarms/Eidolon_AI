private var playerTransform:Transform;// we want to always be moving to the player
private var waypointControllerScript:WaypointController;// to find a local waypoint, we need the waypoint controller
private var closestWaypoint:GameObject;// the GO of our current waypoint that we're moving to
private var playerLocation = new List.<Transform>(); // this is how we will get to the player
private var spawnTime:float;// save the creation time for operations in the first few seconds
var randomSphere:Vector3;
var randomSpeed:float;

var patrolWaypoint : Transform[]; // The amount of Waypoints you want
var patrolSpeed : float = 3; // The walking speed between Waypoints
var loop : boolean = true; // Do you want to keep repeating the Waypoints
var player : Transform; // Referance to the Player
var dampingLook = 6.0; // How slowly to turn
var pauseDuration : float = 0; // How long to pause at a Waypoint
     
private var curTime : float;
var currentWaypoint : int = 0;
private var character : CharacterController;

function Awake() {
	NotificationCenter.DefaultCenter().AddObserver(this,"GameOver");
	NotificationCenter.DefaultCenter().AddObserver(this,"Pause");
	NotificationCenter.DefaultCenter().AddObserver(this,"Unpause");
	NotificationCenter.DefaultCenter().AddObserver(this,"WonRound");
	NotificationCenter.DefaultCenter().AddObserver(this,"PlayerDead");
	NotificationCenter.DefaultCenter().AddObserver(this,"Reset");
	NotificationCenter.DefaultCenter().AddObserver(this,"Alert");
	NotificationCenter.DefaultCenter().AddObserver(this,"Wall");
	//NotificationCenter.DefaultCenter().AddObserver(this,"Wall2");
	NotificationCenter.DefaultCenter().AddObserver(this,"NoWall");
}

function Alert() {
	if(currentState != enemyStates.alert){
		//Debug.Log("I'm alert!");
		currentState = currentState.alert;
	}
}



//private var isMoving:boolean;
private var wallHit:boolean;
private var collPoint;


function Wall2 (notification : Notification) {
	var theCol:Collider = notification.data;
	//Debug.Log(theCol.bounds.size);
	var newBound:Vector3 = Vector3(theCol.bounds.size.x,0,theCol.bounds.size.z);
	character.Move(newBound * patrolSpeed * Time.deltaTime);
	Debug.DrawLine(transform.position, newBound, Color.red, 2); 
}

function Wall(notification : Notification) {
	wallHit = true;
	collPoint = notification.data;
	
	if(currentState != enemyStates.wall){
		//Debug.Log("I'm alert!");
		currentState = currentState.wall;
	}
	
	/*
	//Debug.Log("it's a wall!");
	//Debug.Log(notification.data);
	var targetDir:Vector3;
    targetDir = target.position - transform.position;
	var angle = Vector3.Angle(transform.forward, collPoint);
	var inNormal:Vector3;
	var newPos:Vector3;
	if (angle > 90){
	    //go right
	    inNormal = Vector3.right;
	}else{
	    //go left
	    inNormal = Vector3.left;
	}
	if (isMoving == true){
		Debug.Log(transform.position);
		if (transform.position == newPos){
			isMoving = false;
		}
	}
	//if (isMoving != true){
		newPos = Vector3.Reflect(transform.position, inNormal);
		//Debug.Log(transform.position);
		//Debug.Log("newPos = "+newPos);
		character.Move(newPos * patrolSpeed * Time.deltaTime);
		//isMoving = true;
	//}
	Debug.Log(angle);
	//Debug.Log(isMoving);
	//Debug.DrawLine(transform.position, newPos, Color.red, 2);
	Debug.DrawLine(collPoint, newPos, Color.red, 2);
	//MoveAndRotate(newPos);
	*/
}

function NoWall(){
	wallHit = false;
}

function GameOver() {
	//tick should stop moving
	isUpdateRunning = false;
}

function Pause() {
	//tick should stop moving
	isUpdateRunning = false;
	
	for(var state:AnimationState in animation) {
		state.speed = 0;
	}
	
	// stop all animations
	// stop the logic

}

function Unpause() {
	// tick should start moving
	isUpdateRunning = true;
	
	for(var state:AnimationState in animation) {
		state.speed = 1;
	}
	
	// start all animations
	// start the logic

}
function WonRound() {
	// kill the enemy
	Die();
	// BUG: all our enemies disappear
}

function PlayerDead() {
	//tick should stop moving
	isUpdateRunning = false;
}

function Reset() {
	// kill the enemy
	Die();
}


function Start() {
	playerTransform = GameObject.FindGameObjectWithTag("Player").transform; // get the player
	waypointControllerScript = GameObject.FindGameObjectWithTag("waypointController").GetComponent(WaypointController);// get the waypoint controller
	closestWaypoint = waypointControllerScript.FindClosestWaypoint(transform);// get the closest waypoint
	playerLocation = closestWaypoint.GetComponent(Waypoint).GetPlayerLocation(); // get that waypoint's path to the player and store it locally
	WaitAndUpdate();// begin asking local waypoints for the way to the player
	currentState = enemyStates.start; // set the state to the start state for the logic we want to run in the first few seconds
	spawnTime = Time.time;// save the creation time for operations in the first few seconds
	transform.position.y = 1.5;// offset the enemy down to the floor (may need to change this value for your level)
	randomSphere = Random.insideUnitSphere * 2;
	randomSpeed = Random.Range(-1,1);
	character = GetComponent(CharacterController);
	isMoving = false;
}

private var velocity = Vector3.zero; // variable needed by the SmoothDamp method

// enemy states: run, attack, idle

enum enemyStates {patrol, alert, wall, run, attack, idle, start,sawPlayer,gameOver} // the different states our enemy can be in

var currentState : enemyStates; // create a local variable of the above type to create a state machine
var isStateChangeEnabled:boolean = true;// debug variable allowing us to turn on/off automatic state changes
var stopPatrolling:boolean = false;
//var step:int = 1;

function patrol(){
     
	var patrolTarget : Vector3 = patrolWaypoint[currentWaypoint].position;
	var moveDirection : Vector3 = patrolTarget - transform.position;
	var dir = (target.position - transform.position).normalized;
	var rot = Quaternion.LookRotation(dir);
	var hit:RaycastHit;
	
	patrolTarget.y = transform.position.y; // Keep waypoint at character's height
	
	/*if (Physics.Raycast(transform.position, transform.forward, hit, 5 , wallLayer)){
						if(hit.transform != transform){
							Debug.DrawLine(transform.position, hit.point, Color.red);
							//Debug.Log("I'm working");
							dir += hit.normal * 5;
							Debug.Log(dir);
						}
		}*/
		
		//transform.rotation = Quaternion.Slerp(transform.rotation, rot, Time.deltaTime * dampingLook);
		//character.Move(dir * patrolSpeed * Time.deltaTime);
		
		if(stopPatrolling != true){   
			if(moveDirection.magnitude < 0.5){ // If this number is 1 the character will jerk the last bit to the waypoint and not be over it
				// any lower and the character will get stuck for a second over the waypoint on the iPhone
				if (curTime == 0)
					curTime = Time.time; // Pause over the Waypoint
				if ((Time.time - curTime) >= pauseDuration){
					currentWaypoint++;
					//currentWaypoint+=step;
					curTime = 0;
				}
			}else{
				//transform.LookAt(target); // Use this instead of below to look at target without damping the rotation
				// Look at and dampen the rotation
				//Debug.Log("i should be moving");
				var rotation = Quaternion.LookRotation(patrolTarget - transform.position);
							
				transform.rotation = Quaternion.Slerp(transform.rotation, rot, Time.deltaTime * dampingLook);

				character.Move(dir * patrolSpeed * Time.deltaTime);
				//MoveAndRotate(closestWaypoint.transform.position + randomSphere);
				}
		}
}

var startSpeed:float = 1;// how fast should it move in the beginning
var startDuration:float = 0.5;// how long at the beginning of its life should the enemy move forward? (in seconds)
private var alertTime:float = 1;
var alertTimeLength:float;
var alertSpeed:float = 5;
alertTime = alertTimeLength;

private var hasAttackPlayed:boolean = false;  // boolean to store if we've played the attack animation. Naming of this variable isn't the best. :-\
var isUpdateRunning:boolean = true;

function OnControllerColliderHit (hit : ControllerColliderHit )
{
	//Debug.DrawRay(hit.point, hit.normal);
	if(hit.collider.tag == "walls"){
    	//Debug.Log("Hit the wall");
    }
	if (hit.collider.tag != "Player"){
		//Debug.Log("i collided with something?");
	}
}

var playerLayer: LayerMask;
var wallLayer: LayerMask;

function Update () { // every frame
				//var ray = new Ray (transform.position, transform.forward);
				//var hit: RaycastHit;
				//var fwd = transform.TransformDirection (Vector3.forward);

	//Debug.Log(currentState);
	
	if (isUpdateRunning) {
	


		// checking if the state needs to change (transition)
		if (isStateChangeEnabled) { // if we want the script to automatically change the state
			CheckStateChange(); // go through a decision tree to see if we need to change state
		}// end isStateChangeEnabled if
		
		// run commands that have to do with the current state.
		
		switch(currentState) {// run the current state of our enemy

			case enemyStates.start:// if we just started, move foward
				// enemy to move forward
				transform.Translate(Vector3.forward * Time.deltaTime * startSpeed);// move forward based on our two user settings
				
				// after 2 seconds, change to Run
				if (Time.time > spawnTime + startDuration) {// calculates how long we should stay in this state
					currentState = enemyStates.patrol;// and we set it to run once we've finished our timer
				} // end Timer if
				//Debug.Log("inside the start state");// //Debug testing text (DISABLE EVENTUALLY)
				break;// that ends the start state
			
			case enemyStates.patrol:
				//target = 
				//Avoid();
				if(currentWaypoint < patrolWaypoint.length){
    				patrol();
    			}else{
   					if(loop){
    					currentWaypoint=0;
    				}
    			}
    			/*
    			if(loop){
    				step = 1;
    				if(currentWaypoint < patrolWaypoint.length){
	    				patrol();
	    			} else {
						currentWaypoint=0;
					}
				} else {
					if((currentWaypoint < patrolWaypoint.length && step == 1)||(step == -1 && currentWaypoint >= 0)){
	    				patrol();
	    			} else {
	    				step *= -1;
						currentWaypoint += (step*2);
					}
				}*/
				break;
				
			case enemyStates.alert:
				alertTime -= Time.deltaTime;
				if (alertTime > 0) {// calculates how long we should stay in this state
					stopPatrolling = true;
					maxSpeed = alertSpeed + randomSpeed;
					maxRotationSpeed = 8 + randomSpeed;
					MoveAndRotate(playerTransform.position);
					var reflectAngle = Vector3.Reflect(transform.position, Vector3.right);
					/*if (Physics.Raycast (ray, hit, 100, playerLayer)) {
						//print ("There is something in front of the object!");
						Debug.DrawLine(ray.origin, hit.point, Color.red);
						Debug.DrawLine(hit.point, reflectAngle, Color.red);	
					}*/
					//MoveAndRotate(closestWaypoint.transform.position + randomSphere);
				}else{
					stopPatrolling = false;
					currentState = enemyStates.patrol;
					alertTime = alertTimeLength;
				} 
				break;
				
			case enemyStates.wall:
				var newPos:Vector3;
				var dir = (newPos - transform.position);
				var rot = Quaternion.LookRotation(dir);
				var angle = Vector3.Angle(transform.position, target.position);
				var inNormal:Vector3;
				
				if (wallHit != false){
					if (angle > 90){
					    //go right
					    //inNormal = Vector3.right;
					    inNormal = Vector3(0,0,1);
					}else{
					    //go left
					    //inNormal = Vector3.left;
					    inNormal = Vector3(0,0,-1);
					}
					//newPos = Vector3.Reflect(collPoint, inNormal);
					newPos = Vector3.Reflect(transform.position, inNormal);
					//transform.rotation = Quaternion.Slerp(transform.rotation, rot, Time.deltaTime * 2);
					//character.Move(Vector3.forward * patrolSpeed * Time.deltaTime);

					//MoveAndRotate(newPos);
					transform.position = Vector3.SmoothDamp(transform.position,newPos,velocity,smoothTime,maxSpeed);
					Debug.Log(angle);
					Debug.DrawLine(collPoint, newPos, Color.red, 2);
				}else{
					currentState = enemyStates.patrol;
				}
				break;
				
			case enemyStates.run: // Run - we'll be in this state most of the time
				maxSpeed = 8 + randomSpeed;
				maxRotationSpeed = 8 + randomSpeed;
				//animation.Play("run"); // play the run animation by golly!
				//Debug.Log("inside the run state");// //Debug testing text (DISABLE EVENTUALLY)
				MoveAndRotate(closestWaypoint.transform.position + randomSphere); // and move to the current waypoint
				break;// that ends the run state
				
			case enemyStates.sawPlayer:// if we saw the player
				maxSpeed = 14 + randomSpeed;
				maxRotationSpeed = 10 + randomSpeed;
				//animation.Play("run");// keep running at him!
				//Debug.Log("inside the sawPlayer state");// //Debug testing text (DISABLE EVENTUALLY)
				MoveAndRotate(playerTransform.position); // start running at the player instead of the waypoint
				break;// that ends the saw player state
				
			case enemyStates.attack:// attack the player
				maxSpeed = 20 + randomSpeed;
				maxRotationSpeed = 20 + randomSpeed;
				if (!hasAttackPlayed) {// if we have NOT played the attack animation yet
					//animation.Play("attack");// play the animation attack once, its last frame is held
					hasAttackPlayed = true;// to make sure we don't play the animation again
				} // end has attack not played if
				MoveAndRotate(playerTransform.position);// move closer to the player
				//Debug.Log("inside the attack state");// //Debug testing text (DISABLE EVENTUALLY)
				break; // that ends the attack state
					
			case enemyStates.idle:// if we want our enemy to idle
				//animation.Play("idle"); // play the idle animation
				//Debug.Log("inside the idle state");// //Debug testing text (DISABLE EVENTUALLY)
				break;// that ends the idle state
				
			case enemyStates.gameOver:// if the game is paused or done
				//Debug.Log("inside the gameOver state");// //Debug testing text (DISABLE EVENTUALLY)
				break;// that ends the game over state
		
		}// end of current state switch
	}//	end isUpdateRunning IF
} // end of update
var waypointDistance:float = 4;// check if we're close enough to the waypoint to begin moving to the next one on the list
var sawPlayerDistance:float = 10; // how far away from the player should we follow them? 
var attackDistance:float = 6;// how far away from the player should we attack? 
var hitDistance:float = 2;// how far away from the player should we say we hit the player?

function CheckStateChange() {// decision tree to see if we need to change states
	if (currentState != enemyStates.start) {// to make sure we don't change state during the start state, check it
		// if playerLocation.Count > 1 then we need to follow waypoint
		// if playerLocation.Count = 1 then we need to follow player
		if (playerLocation.Count > 1) {// path to player is the number of waypoints to the player, and if there is more than one, we need to follow the waypoints
			//currentState = enemyStates.run; // run after the waypoint
		} else {// path to player is the number of waypoints to the player, and if there is one, we're at the closest waypoint to the player
			// test if we are close enough to the player to say we saw them
			var distanceToPlayer = Vector3.Distance(transform.position,playerTransform.position); // see how far we are from the player
			if (distanceToPlayer < sawPlayerDistance) {// Are we close enough to run after the player?
				if (distanceToPlayer < attackDistance) { // Are we close enough to attack the player?
					if(distanceToPlayer < hitDistance){// Are we close enough to hit the player?
					// hit the player, let game know and die
						NotificationCenter.DefaultCenter().PostNotification(this,"EnemyDead"); // tell other objects that we died to attack the player
						Die();// and we explode (die)
					} else { // if we are NOT close enough to hit the player
					currentState = enemyStates.attack;// ATTACK
					}// end HIT else
				} else {// if we are NOT close enough to attack the player
				currentState = enemyStates.sawPlayer;// GET HIM
				} // end ATTACK else
			}// end saw player IF
		}// end player location count IF
	}// end start state check IF
}// end CheckStateChange function

function WaitAndUpdate() {// create an infinite loop to call our update wsaypoints function at a certain time step
	while(true) {// infinite loop (dangerous without yield)
		UpdateWaypoints();// update the positions of the waypoint and player location list
		randomSphere = Random.insideUnitSphere * 2;
		randomSpeed = Random.Range(-1,1);
		yield WaitForSeconds(0.5);// every .5 seconds, so we don't re-process this info every frame
	} // end of infinite loop. We should never be here
}// end WaitAndUpdate function

function Die() {// function to die and remove ourselves from the game/hierarchy
	Destroy(transform.root.gameObject);// destroy our root, which destroys all the children
}// end Die function

function UpdateWaypoints() {// this function checks the distance values and sees if we need to update the waypoint

	// distanceEnemyWaypoint stores the float distance from US to the Closest Waypoint only in the X,Z axis!
	var distanceEnemyWaypoint = Vector3.Distance(transform.position,Vector3(closestWaypoint.transform.position.x,transform.position.y,closestWaypoint.transform.position.z));

	if (distanceEnemyWaypoint < waypointDistance && // if we are too close to the next waypoint
		playerLocation.Count > 1) { // and we have more waypoints to move towords
		closestWaypoint = playerLocation[playerLocation.Count - 2].gameObject; // we take two off since Count is one beyond our array, and the last member is the current waypoint
	} // end distance check and further waypoint check IF
	playerLocation = closestWaypoint.GetComponent(Waypoint).GetPlayerLocation(); // also update the player location list
}// end UpdateWaypoints function

var maxRotationSpeed:float = 8; // how fast can the enemy rotate?
private var smoothTime:float = 0.1; // how quickly can we move (ignore, see maxSpeed)
var maxSpeed:float = 12; // controls the maximum speed of position changes
var target:Transform;

//function to change the position and rotation based on a target position
function MoveAndRotate(targetPosition:Vector3) {
	var thisPosition:Vector3 = transform.position; // create a local variable to hold this info since we access it often and we need to change it slightly
	targetPosition = Vector3(targetPosition.x,thisPosition.y,targetPosition.z);// set y to us for no moving up/ pointing up

	transform.position = Vector3.SmoothDamp(thisPosition,targetPosition,velocity,smoothTime,maxSpeed);// move closer to target

	var toRotation:Quaternion;
	if (targetPosition - thisPosition != Vector3.zero) {// as long as the view change is not zero
		toRotation = Quaternion.LookRotation(targetPosition - thisPosition);// set a target rotation
	}
	transform.rotation = Quaternion.RotateTowards(transform.rotation,toRotation,maxRotationSpeed);// rotate towords target max rotation speed controls how fast we rotate
	//////////

}

function ApplyDamage() {
	NotificationCenter.DefaultCenter().PostNotification(this,"EnemyKilled");
	Die();
}