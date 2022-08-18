<?php
	if($_POST)
	{

		$from      = $_POST['from'];
		$message = $_POST['message'];
		$subject = $_POST['subject'];
		
		$from = trim($from);
		$subject = trim($subject);
		$message = trim($message);

		if($from != '' || $subject != '' || $message != '') 
		{
			return "ERROR";
		}
		else{
			$subject = "From web page: " . $subject;
					
			$to      = 'hans@tornquist.org';

			$headers = 'From: ' . $from . "\r\n" .
					'Reply-To: ' . $from . "\r\n" .
					'X-Mailer: PHP/' . phpversion();
			if (mail($to, $subject, $message, $headers))
			{
				$respons =  "OK";
			}
			else
			{
				$respons = "ERROR";
			}
			echo $respons;
		}
	}
	else
	{
	}
?>
