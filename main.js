var w, h, input = $('#input'), output = $('#output'), side = $('.side'), inputTD = $('.inputTD'), table = $("#mainTable"), commandLineText = "";

$(document).delegate('#input', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});

window.setInterval(function(){
	w = window.innerWidth;
	h = window.innerHeight;
	
	h *= .95;
	
	table.height(h);
	inputTD.height(.5*inputTD.parent().height());
	side.height(h);
},16);

var sanitizeText = function(text) {
	var len = text.length, c, outText = "", i;
	
	for(i = 0; i < len; i++) {
		c = text.charAt(i);
		
		if(c == '<')
			outText += "&lt";
		else if(c == '>')
			outText += "&gt";
		else if(c == '&')
			outText += "&amp";
		else
			outText += c;
	}
	
	return outText;
};

var removeComments = function(text) {
	var len = text.length, c, nc, outText = "", i, inQuotes = false;
	
	for(i = 0; i < len; i++) {
		c = text.charAt(i);
		if(i < len-1)	nc = text.charAt(i+1);
		else			nc = -1;
		
		if(c == '"')
			inQuotes = !inQuotes;

		if(!inQuotes)
			if(c == '/' && nc == '/') {
				while(c != '\n' && i < len)
					c = text.charAt(++i);
				continue;
			}
			else if(c == '/' && nc == '*') {
				i++;
				while(!(c == '*' && nc == '/')) {
					c = text.charAt(++i);
					if(i < len-1)	nc = text.charAt(i+1);
					else			break;
				}
				i++;
				continue;
			}
	
		outText += c;
	}
	
	return outText;
};

var setOutput = function(text) {
	var h = output.height();
	output[0].innerHTML = "<pre>" + commandLineText + "</pre>";
	output.height(h);
	
	output[0].scrollTop = output[0].scrollHeight;
};

var getInput = function() {
	return removeComments(input[0].value);
};

var clear = function() {
	commandLineText = "";
};
var print = function(text) {
	commandLineText += sanitizeText(String(text));
};
var println = function(text) {
	print(text+'\n');
};
var flush = function() {
	setOutput(commandLineText);
};

var regionMatches = function(str1, off1, str2, off2, len) {
	for(var i = 0; i < len; i++) {
		if(str1.charAt(off1+i) != str2.charAt(off2+i))
			return false;
	}
	
	return true;
};

var isWhiteSpace = function(c) {
	return ' \t\n\r\v'.indexOf(c) > -1;	
};

var isAlphabetic = function(str) {
	return str.length == 1 && str.match(/[a-z]/i);
};

var isNumber = function(o) {
	//ms("isNumber()");
	return typeof o == "number" || (typeof o == "object" && o.constructor === Number);
};

var isString = function(o) {
	//ms("isString()");
	return typeof o == "string" || (typeof o == "object" && o.constructor === String);
};

var isVariable = function(o) {
	//ms("isString()");
	return typeof o == "object" && o.constructor === Variable;
};

var isBoolean = function(o) {
	//ms("isBoolean()");
	return typeof o == "boolean" || (typeof o == "object" && o.constructor === Boolean);
};

var V_NULL = -1, V_NUMBER = 0, V_OBJECT = 1, V_STRING = 2, V_TEXTURE = 3, V_ACTION = 4, V_VARIABLE = 5, V_POINTER = 6, V_BOOLEAN = 7;
var P_NUMBER = 0, P_OBJECT = 1, P_ACTION = 2, P_VARIABLE = 3, P_STRING = 4, P_NEW_ACTION = 5, P_NEW_OBJECT = 6, P_CONSTANT = 7;
var I_EQUAL = 0, I_NOT_EQUAL = 1, I_LESS = 2, I_LESS_EQUAL = 3, I_GREATER = 4, I_GREATER_EQUAL = 5;
var C_EQUAL, C_NOT_EQUAL, C_LESS, C_LESS_EQUAL, C_GREATER, C_GREATER_EQUAL;

/************************************ VARIABLE CLASS *********************************/

//ms("Creating Variable...");

function Variable() {	
	this.value = NaN;
	this.type = V_NULL;
};
	Variable.prototype.setv = function(vari) {
		if(vari != this) {
			this.value = vari.value;
			this.type = vari.type;
		}
	};
	Variable.prototype.set1 = function(value) {
		if(this.type == V_POINTER)
			this.value.set1(value);
		else {
			if(isVariable(value))
				this.setv(value);
			if(isNumber(value))
				this.set(value, V_NUMBER);
			else if(isString(value))
				this.set(value, V_STRING);
			else if(isBoolean(value))
				this.set(value, V_BOOLEAN);
			else
				this.set(value, V_OBJECT);
		}
		return this;
	};
	Variable.prototype.set = function(value, type) {
		if(this.type == V_POINTER)
			this.value.set(value, type);
		else {
			if(type == V_NUMBER)
				this.value = parseFloat(value);
			else if(type == V_STRING)
				this.value = String(value);
			else
				this.value = value;
			this.type = type;
		}
		return this;
	};
	Variable.prototype.point = function(variable) {
		if(other != this) {
			this.value = variable;
			this.type = V_POINTER;
		}
		return this;
	};
	
	Variable.prototype.adde = function(num)	{
		this.value += num;
		return this;
	};
	Variable.prototype.sube = function(num)	{
		this.value -= num;
		return this;
	};
	Variable.prototype.multe = function(num) {
		this.value *= num;
		return this;
	};
	Variable.prototype.dive = function(num)	{
		this.value /= num;
		return this;
	};
	Variable.prototype.powe = function(num)	{
		this.value = Math.pow(this.value,num);
		return this;
	};
	
	Variable.prototype.isNumber = function() 	{return this.type == V_NUMBER;};
	Variable.prototype.isBoolean = function()	{return this.type == V_BOOLEAN;};
	Variable.prototype.isString = function()	{return this.type == V_STRING;};
	Variable.prototype.isObject = function()	{return this.type == V_OBJECT;};

	Variable.prototype.get = function() {
		if(this.type == V_NUMBER)
			return parseFloat(this.value);
		else if(this.type == V_STRING)
			return String(this.value);
		else if(this.type == V_BOOLEAN)
			return Boolean(this.value);
		else
			return this.value;
	};

	Variable.prototype.toString = function() 	{return String(this.value);};

	Variable.prototype.operation = function(operation, other) {		
		switch(operation) {
			case "+=":	return this.adde(other.get());
			case "-=":	return this.sube(other.get());
			case "*=":	return this.multe(other.get());
			case "/=":	return this.dive(other.get());
			
			default:	ms("Operation does not exist.");
		}
	};
	
/************************************ SCRIPT CLASS *********************************/
var actionMap = {};

/*
	Action has a list of variables, where each index (0, 1, 2, 3, ...) corresponds to a given variable.
	
	When an action is created, it has a list of these numbers, and a list for the arguments (a subset of varIndices).
	
	Only when an action is run are the variables allocated.
*/

function Action(name, varIndices, argIndices, constList, hasOutput) {
	this.name = name;
	this.varIndices = varIndices;
		this.varNum = varIndices.length;
	this.argIndices = argIndices;
		this.argNum = argIndices.length;
	this.constList = constList;
		this.constNum = constList.length;
	this.hasOutput = hasOutput;
	
	actionMap[name] = this;
};
	Action.prototype.run = function(output, argList, parVarList){		
		// First, instantiate all variables! Used to be preinstantiated, but this prevented recursion...
				
		if(output)
			ms(this.name + ", " + output.value);
		else
			ms(this.name + ", null");
		
		var varList = [], value;
		for(var i = 0; i < this.varNum; i++) {
			varList[i] = new Variable();
		}
		
			
		// Set Variables in New List to Arguments Passed
		ms(this.argNum + ", " + argList.length);
		for(var i = 0; i < this.argNum; i++) {
			varList[this.argIndices[i]].setv(argList[i]);
			ms(argList[i].value + ", " + argList[i].type);
		}
		
		// Set Constants
		for(var i = 0; i < this.constNum; i++) {
			var vari = varList[this.constList[i][0]];
			vari.set(this.constList[i][1],this.constList[i][2]);
		}
		
		
		value = this.call(varList, parVarList);
		
		if(output)
			output.set1(value);
				
		
		return output;
	};
	Action.prototype.call = function(varList, parVarList) {};

function inherit(o) {
	function F() {};
	F.prototype = o;
	return new F();
};

function MiscAction(name, varIndices, argIndices, constList, hasOutput) {
	this.name = name;
	this.varIndices = varIndices;
		this.varNum = varIndices.length;
	this.argIndices = argIndices;
		this.argNum = argIndices.length;
	this.constList = constList;
		this.constNum = constList.length;
	this.hasOutput = hasOutput;
	
	actionMap[name] = this;
};
MiscAction.prototype = inherit(Action.prototype);
	MiscAction.prototype.call = function(varList, parVarList) {
		var var0, var1, var2;
		switch(this.name) {
			case "_move":
			case "_return":
			case "_get":
				return varList[0].get();

			case "_if":
				return (varList[0].get() == true) ? 1 : 0;
							
			case "print":
				print(varList[0].get());
				flush();
				break;
			case "println":
				println(varList[0].get());
				flush();
				break;
			case "clear":
				clear();
				flush();
				break;
				
			case "sqrt":
				return Math.sqrt(varList[0].get());
			case "cos":
				return Math.cos(varList[0].get());
			case "sin":
				return Math.sin(varList[0].get());
			case "tan":
				return Math.tan(varList[0].get());
			case "asin":
				return Math.asin(varList[0].get());
			case "acos":
				return Math.acos(varList[0].get());
			case "atan":
				return Math.atan(varList[0].get());

			case "_!=":
				return varList[0].get() != varList[1].get();				
			case "_<":
				return varList[0].get() < varList[1].get();
			case "_<=":
				return varList[0].get() <= varList[1].get();
			case "_>":
				return varList[0].get() > varList[1].get();
			case "_>=":
				return varList[0].get() >= varList[1].get();
			case "_==":
				return varList[0].get() == varList[1].get();

			case "_&&":
				return (varList[0].get() && varList[1].get());
			case "_||":
				return (varList[0].get() || varList[1].get());
			case "_!":
				return !varList[0].get();
							
			case "_+":
				return varList[0].get()+varList[1].get();			
			case "_-":
				return varList[0].get()-varList[1].get();
			case "_*":
				return varList[0].get()*varList[1].get();
			case "_/":
				return varList[0].get()/varList[1].get();
			case "_^":
				return Math.pow(varList[0].get(),varList[1].get());
			case "_%":
				return varList[0].get() % varList[1].get();
		}
		
		return NaN;
	};
	
// Declare Base Actions
new MiscAction("print", [0], [0], [], false);
new MiscAction("println", [0], [0], [], false);
new MiscAction("clear", [], [], [], true);

new MiscAction("sqrt", [0], [0], [], true);
new MiscAction("sin", [0], [0], [], true);
new MiscAction("cos", [0], [0], [], true);
new MiscAction("tan", [0], [0], [], true);
new MiscAction("asin", [0], [0], [], true);
new MiscAction("acos", [0], [0], [], true);
new MiscAction("atan", [0], [0], [], true);

new MiscAction("_move", [0], [0], [], true);
new MiscAction("_return", [0], [0], [], true);
new MiscAction("_if", [0], [0], [], true);

new MiscAction("_<", [0, 1], [0, 1], [], true);
new MiscAction("_<=", [0, 1], [0, 1], [], true);
new MiscAction("_>", [0, 1], [0, 1], [], true);
new MiscAction("_>=", [0, 1], [0, 1], [], true);
new MiscAction("_==", [0, 1], [0, 1], [], true);
new MiscAction("_!=", [0, 1], [0, 1], [], true);

new MiscAction("_+", [0, 1], [0, 1], [], true);
new MiscAction("_-", [0, 1], [0, 1], [], true);
new MiscAction("_*", [0, 1], [0, 1], [], true);
new MiscAction("_/", [0, 1], [0, 1], [], true);
new MiscAction("_^", [0, 1], [0, 1], [], true);
new MiscAction("_%", [0, 1], [0, 1], [], true);
new MiscAction("_&&", [0, 1], [0, 1], [], true);
new MiscAction("_||", [0, 1], [0, 1], [], true);
new MiscAction("_!", [0], [0], [], true);

new MiscAction("_get", [0], [0], [], true);


/************************************ TASK CLASS ****************************/

function Task(actionName, parInds, outputInd) {
	this.actionName = actionName;
	this.parInds = parInds;
	this.outputInd = outputInd;
};
	Task.prototype.run = function(parVarMap) {
		var outputVar, parVars = [];
						
		if(this.outputInd != null)
			outputVar = parVarMap[this.outputInd];
		else
			outputVar = null;

		for(var i = 0; i < this.parInds.length; i++) {
			parVars[i] = parVarMap[this.parInds[i]];
		}
		
		return actionMap[this.actionName].run(outputVar, parVars, parVarMap);
	};
	
/************************************ SCRIPT CLASS ********************************/

function Script(name, varIndices, argIndices, constList, hasOutput, taskList) {
	this.name = name;
	
	this.varIndices = varIndices;
		this.varNum = varIndices.length;
	this.argIndices = argIndices;
		this.argNum = argIndices.length;
	this.constList = constList;
		this.constNum = constList.length;
	this.hasOutput = hasOutput;
	
	this.taskList = taskList;
		this.taskNum = taskList.length;
	
	actionMap[name] = this;
};
Script.prototype = inherit(Action.prototype);
	Script.prototype.call = function(varList, parVarList) {		
		var a, t, didRun;
		for(var i = 0; i < this.taskNum; i++) {
			t = this.taskList[i];

			a = t.actionName;								
			didRun = false;
			
			if(a == "_return") {
				didRun = true;
				return varList[t.parInds[0]].get();
			}
			else if(a == "_move" || a == "_if") {
				didRun = true;
				
				i += t.run(varList).get();
			}
			
			if(!didRun)
				t.run(varList);
		}
		
		return null;	
	};

var ms = function(text) {
	//alert(text);
};


/************************************ PARSE STRING *********************************/
function compile(name, str, varNameMap, varMap, varIndices, argIndices) {
	var pos = -1, c, lc, strLen = str.length;
	var constList = [], constMap = {}, taskList = [], hasOutput = false;
	
	var msg = function(text) {
		ms(pos + ", " + c + ", " + text);
	};
			
	var nibble = function(substr) {
		msg("nibble(" + substr + ")");
		len = substr.length;
		if(regionMatches(str, pos, substr, 0, len)) {
			pos += len;
			lc = c;
			c = (pos < strLen) ? str.charAt(pos) : -1;
			return true;
		}
		else
			return false;
	};
			
	var nibbleMisc = function() {
		msg("nibbleMisc()");
		
		var argLen = arguments.length, cc;
		for(var i = 0; i < argLen; i++) {
			cc = arguments[i];
			if(nibble(cc))
				return cc;
		}
		return -1;
	};

	var eatTo = function(substr) {
		msg("eatTo()");
		var outStr = "", len = substr.length, i;
		for(i = pos; i < strLen-len; i++) {
			if(regionMatches(str, i, substr, 0, len)) {
				outStr = str.substring(pos,i);
										
				pos = i+len;
				lc = c;
				c = (pos < strLen) ? str.charAt(pos) : -1;

				return outStr;
			}
		}
		
		return NaN;
	};
		
	var didEat = function(cc) {
		msg("didEat()");
		return lc == cc;
	};

	var eatChar = function() {
		msg("eatChar()");
		lc = c;
		c = (++pos < strLen) ? str.charAt(pos) : -1;
	};
	
	var getChar = function() {
		c = (pos < strLen) ? str.charAt(pos) : -1;
	};
	
	var eat = function(c) {
		if(!nibble(c))
			ms("Expected: " + c);
	};
	
	var check = function(substr) {
		msg("check(" + substr + ")");
		len = substr.length;
		return regionMatches(str, pos, substr, 0, len);
	};
	
	var done = function() {return c == -1;};

	var eatSpace = function() {
		msg("eatSpace()");
		while(isWhiteSpace(c)) 
			eatChar();
		msg("~eatSpace()");
	};

	var parse = function() {
		msg("parse()");
		
		eatChar();
		var v = parseStatements();
		if (c != -1)
			ms("Unexpected parse(): " + c);
		
		msg("Returning script!!");
		return new Script(name, varIndices, argIndices, constList, hasOutput, taskList);
	};
	
	// New Script
	var parseStatements = function() {
		msg("parseStatements()");
		var v = parseStatement();

		for(;;) {
			eatSpace();
						
			if(v == -2 || ((nibble(';') || didEat('}')) && !done())) {
				v = parseStatement();
			}
			else
				return v;
		}
	};
	
	var parse1Statement = function() {
		var v = parseStatement();

		eatSpace();
		eat(';');
		return v;
	};

	var parseStatement = function() {
		eatSpace();
		
		if(nibble("return"))
			addTask("_return", [parseExpression()], addTempBuffer());
		else if(nibble("if")) {
        	var bool, hasElse, skipIf = addConstant(0, V_NUMBER), skipElse = addConstant(0, V_NUMBER);
        	
        	eatSpace();
        	eat('(');
        	//alert('parsing inside of if!');
        	bool = parseExpression();
        	eat(')');
        	
        	addTask("_if", [bool], addTempBuffer());
        	
        	//If False, Skip to After If
        	addTask('_move',[skipIf],addTempBuffer());

        	var num1 = taskList.length, num2, num3;
        	eatSpace();
        	if(nibble('{')) {
        		parseStatements();
        		eat('}');
        	}
    		else
    			parse1Statement();
        	num2 = taskList.length;
        	
        	setConstant(skipIf, 1+num2-num1, V_NUMBER);
        	//alert("if: " + (1+num2-num1));

        	eatSpace();
        	hasElse = false;
        	if(nibble("else")) {
        		hasElse = true;
            	addTask('_move',[skipElse],addTempBuffer());
        		eatSpace();
        		if(nibble('{')) {
            		parseStatements();
            		eat('}');
            	}
        		else
        			parse1Statement();
        	}
        	else
        		removeRegister(skipElse);
        	num3 = taskList.length;
        	
        	if(!hasElse)
	        	setConstant(skipIf, num2-num1, V_NUMBER);
        	setConstant(skipElse, -1+(num3-num2), V_NUMBER);
	        	
        	//alert("else: " + (-1+num3-num2));
        	
        	return -2;
        }
		else if(nibble("while")) {
        	var bool, reset = addConstant(0, V_NUMBER), skip = addConstant(0, V_NUMBER);

        	var num1 = taskList.length, num2, num3;
        	
        	eatSpace();
        	eat('(');
	        	bool = parseExpression();
        	eat(')');
        	
        	addTask("_if", [bool], addTempBuffer());
        	
        	//If False, Skip to After While
        	addTask('_move',[skip],addTempBuffer());
        	num2 = taskList.length;

        	eatSpace();
        	if(nibble('{')) {
        		parseStatements();
        		eat('}');
        	}
    		else
    			parse1Statement();
        	
        	addTask('_move',[reset],addTempBuffer());
        	num3 = taskList.length;
        	
	        setConstant(reset, -(num3-num1), V_NUMBER);
        	setConstant(skip, (num3-num2), V_NUMBER);
	        	        	
        	return -2;
        }
		else
			return parseExpression();
	};
	
	var parseParameters = function(parameters) {
		var v = parseExpression();
    	if(v == NaN)
    		return;
    	else {
    		for(;;) {
        		eatSpace();
	            if(nibble(',')) { //Next 
	            	parameters.push(v);
	                v = parseExpression();
                } 
	            else {
        			msg("Add var to pars!");

	            	parameters.push(v);
	            	return;
                }
            }
    	}
	};

	var parseExpression = function() {
		var v = parseTerm(), pv, dst, n, eq, other, n;
		
		for(;;) {
			eatSpace();
			if((n = nibbleMisc('+', '-')) != -1) {// addition/subtraction 
				v = parseOperation(nibble('='), v,parseTerm(), n);
			}
			else if((n = nibbleMisc('&&','||')) != -1) // and/or
				v = addTask("_"+n, [v, parseTerm()], addTempBuffer());
			else
				return v;
		}
	};
	
	var parseScript = function(subName) {
		//alert("parseScript()");
		
		var substr = "", subVarNameMap = {}, subVarMap = {}, subVarIndices = [], subArgIndices = [], varNum = 0;
		
		eatSpace();
		eat('(');
		eatSpace();
		
		var varN;
		
		//alert("getting parameters");
		
		// Get Parameters
		if(!nibble(')'))
			while(c != -1) {
				//alert('getting var name!');
				
				eatSpace();
				eat('$');
				
				varN = parseVarName();
				
				//alert('var[' + varNum + '] name: ' + varN);
				
				subVarNameMap[varN] = varNum;
				subVarMap[varNum] = [false, true];
				subVarIndices.push(varNum);
				subArgIndices.push(varNum);
				varNum++;

				//alert('got var: ' + varN);
				
				eatSpace();
				
				if(nibble(')'))
					break;
				else
					nibble(',');
			}
		
		eatSpace();
		eat('{');
		
		//alert('getting internal string');
		
		// Get Internal String
		var brackets = 1;
		while(brackets > 0) {
			substr += c;
			eatChar();
			
			if(c == '{')
				brackets++;
			else if(c == '}')
				brackets--;
		}
		
		eat('}');
		
		new compile(subName, substr, subVarNameMap, subVarMap, subVarIndices, subArgIndices);

		return -2;
	};

	var parseOperation = function(eq, v, pv, operation) {
		msg("parseOperation(" + v + "," + operation + ")");
		var dst;
		
		ms("checking constants... " + v + ", " + pv);
		/*if(isConstant(v) && isConstant(pv)) {
			ms("Constants!");
			
			switch(operation) {
				case "+":
					
					addTask("add", [v, pv], dst);
					break;
				case "-":
					addTask("sub", [v, pv], dst);
					break;
				case "*":
					addTask("mlt", [v, pv], dst);
					break;
				case "/":
					addTask("div", [v, pv], dst);
					break;
				case "^":
					addTask("pow", [v, pv], dst);
					break;
			}
			
			removeRegister(pv);
			ms("Done w/ Constants!");
		}*/
		if(true) {
			dst = addTempBuffer();
			
			addTask("_" + operation, [v, pv], dst);
			if(eq)
				addTask("_get", [dst], v);
						
			v = dst;
		}
		
		return v;
	};
	
	var parseTerm = function() {
		msg("parseTerm()");
		var v = parseFactor(), other, dst, pv, n, eq = false, didEq;
		
		if(v == NaN)
			return v;
		for(;;) {
			eatSpace();
			
			didEq = false;
			
			if(!check('==')) {
				if(nibble('=')) {
					didEq = true;
					ms("EQUALS!");
					
					var pv = parseExpression(), dst = addTempBuffer();
					addTask("_get", [pv], v);
					addTask("_get", [v], dst);
					
					v = dst;
				}
			}
			
			if(!didEq) {
				if((n = nibbleMisc('<', '>', '==', '!=')) != -1) {
					//alert('found operation: ' + n);
					if(n != '==' && n != '!=')
						if(nibble('='))
							n += "=";
					
					other = parseTerm();
					
					v = addTask("_"+n, [v, other], addTempBuffer());
				}
				else if(nibble('/')) { // division
					v = parseOperation(nibble('='), v, parseTerm(), "/");
				} 
				else if(c == '*' || c == '(') { // multiplication
					if(c == '*') {
						eatChar();
						eq = nibble('=');
					}
					
					v = parseOperation(nibble('='), v, parseTerm(), "*");
				} 
				else if(nibble('%')) { // modulo
					v = parseOperation(nibble('='), v, parseTerm(), "%");
				} 
				else
					return v;
			}
		}
	};
	
	var parseFactor = function() {
		msg("parseFactor()");
		var v, dst, n, isVar = false, negate = false, inverse = false, sb="", type;
		eatSpace();

		if((n = nibbleMisc('+','-')) != -1) { // unary plus & minus
			negate = n == '-';
			eatSpace();
		}
		if(nibble('!')) {
			inverse = true;
			eatSpace();
		}

		
		if(nibble('(')) { // brackets
			v = parseExpression();
			eat(')');
		} else if(c == -1 || c == ')' || c == '}') {
			return NaN;
		}
		else { // numbers/variables
			if(c == '$' || c == '#' || c == '"' || c == '@' || c == '&' || isAlphabetic(c)) {
				if(c == '$') {
					type = P_VARIABLE;
					eatChar();
				}
				else if(c == '#') {
					eatChar();
					if(nibble('#'))
						type = P_NEW_ACTION;
					else
						type = P_ACTION;
				}
				else if(c == '@') {
					type = P_OBJECT;
					eatChar();
				}
				else if(c == '&') {
					type = P_NEW_OBJECT;
					eatChar();
				}
				else if(c == '\"') {
					type = P_STRING;	
					eatChar();
				}
				else
					type = P_CONSTANT;
				
				if(type == P_STRING)
					sb = eatTo('\"');
				else
					sb = parseVarName();
			}
			else {
				msg("Building number...");

				var regNum = /[0-9\.]/g;
				
				type = V_NUMBER;
				while(/[0-9\.]/g.test(c)) {
					msg("Added " + c);

					sb += c;
					eatChar();
				}
				msg("Have number: " + sb);				
			}
			
			v = parseValue(sb, type);
		}
		eatSpace();
		if(nibble('^')) { // exponentiation
			v = parseOperation(nibble('='), v, parseFactor(), "^");
		}
		if(negate)
			v = parseOperation(nibble('='), v, addConstant(-1), "*");
		if(inverse)
			v = addTask("_!", [v], addTempBuffer());
		return v;
	};
	
	var parseVarName = function() {
		var sb = "";
		while(/[a-zA-Z0-9]/g.test(c)) {
			sb += c;
			eatChar();				
		}
		return sb;
	};
	
	var parseValue = function(sb, type) {
		msg("parseValue()");
		
		if(type == P_VARIABLE) {
			msg("GETTING VARIABLE!" + sb);
			if(sb in varNameMap) {
				msg("exists...");
				return varNameMap[sb];
			}
			else {
				msg("creating...");
				return addTrueVariable(sb);
			}
		}
		else if(type == P_ACTION) {
			var parInds = [], output;

			eat('(');
			parseParameters(parInds);
			eat(')');
			
			output = addTempBuffer();
			addTask(sb, parInds, output);
			
			msg("Returning Task!!");
			        			
			return output;
		}
		else if(type == P_NEW_ACTION) {
			return parseScript(sb);
		}
		else if(type == P_NUMBER)
			return addConstant(parseFloat(sb), V_NUMBER);
		else if(type == P_STRING)
			return addConstant(String(sb), V_STRING);
		else if(type == P_CONSTANT) {
			if(sb == "TRUE")
				return addConstant(true, V_BOOLEAN);
			else if(sb == "FALSE")
				return addConstant(false, V_BOOLEAN);
			else if(sb == "PI")
				return addConstant(3.14159265, V_NUMBER);
		}
	};
	
	var isConstant = function(v) {
		msg("isConstant(" + v + ")");
		
		con = varMap[v][0];
		msg("isConstant() returning: " + con);
		return con;
	};
	var isTrueVariable = function(v) {
		return varMap[v][1];
	};
	var isTempBuffer = function(v) {
		return !isConstant(v) && !isTrueVariable(v);
	};

	var addRegister = function(isCon, isTru) {
		msg("addRegister()");
		var index = varIndices.length;
		msg("got index?");
		varIndices[index] = index;
		varMap[index] = [isCon, isTru];
		msg("~addRegister()");
		return index;
	};
	var addConstant = function(value, type) {
		//msg("addConstant("+value+","+type+")");
		var index = addRegister(true, false);
		
		constMap[index] = constList[constList.length] = [index, value, type];
		msg("~addConstant()");
		return index;
	};
	var setConstant = function(index, value, type) {		
		constMap[index][1] = value;
		constMap[index][2] = type;
	};
	var addTrueVariable = function(name) {
		msg("added variable: " + name);
		var index = addRegister(false,true);
		varNameMap[name] = index;
		return index;
	};
	var addTempBuffer = function() {
		msg("addTempBuffer()");
		return addRegister(false,false);
	};

	var removeRegister = function(v) {
		
	};
	
	var addTask = function(actionName, parInds, outInd) {
		msg("addTask()");
		taskList.push(new Task(actionName, parInds, outInd));
		return outInd;
	};
	
	return parse();	    
};


// Command Line Printing Functions


var runCode = function() {
	var script = new compile("test", getInput(), {},{},[],[]);
	
	var v = new Variable();
	script.run(v, [], []);
};