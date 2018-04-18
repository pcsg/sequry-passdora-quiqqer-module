<div id="note">
    <i id="note-icon" class="fa fa-exclamation-triangle fa-3x"></i>
    <div id="note-text">
        All passwords to administrate Passdora can be found below.<br>
        <br>
        Log in to Passdora-administration with the "Passdora"-credentials.<br>
        All backups will be encrypted with the "Restore"-key.<br>
        Advanced users may use the "SSH"-credentials for maintenance tasks.<br>
        <br>
        Please <b>print this page</b> and keep it somewhere safe and secure.<br>
        If you lose a password, your <b>data can not be recovered!</b><br>
        After confirming, these <b>passwords can not be displayed again</b>.
    </div>
</div>


<div id="passwords">

    <!-- Passdora -->
    <div class="password-section">
        <div class="pw-header">
            Passdora:
        </div>

        <div class="pw-data">
            <div class="pw-data-row">
                <div class="pw-data-label">
                    <label for="ssh-user" class="fa fa-user fa-lg"></label>
                </div>
                <input type="text" id="ssh-user" value="admin" readonly/>
            </div>

            <div class="pw-data-row">
                <div class="pw-data-label">
                    <label for="ssh-pw" class="fa fa-key fa-lg"></label>
                </div>
                <input type="text" id="ssh-pw" value="{$passwords['quiqqer_pw']}" readonly/>
            </div>
        </div>
    </div>


    <!-- Restore -->
    <div class="password-section" id="restore">
        <div class="pw-header">
            Restore-Key:
        </div>

        <div class="pw-data">
            <div class="pw-data-row">
                <div class="pw-data-label">
                    <label for="ssh-pw" class="fa fa-key fa-lg"></label>
                </div>
                <input type="text" id="ssh-pw" value="{$restore_key}" readonly/>
            </div>
        </div>
    </div>

    <!-- SSH -->
    <div class="password-section">
        <div class="pw-header">
            SSH:
        </div>

        <div class="pw-data">
            <div class="pw-data-row">
                <div class="pw-data-label">
                    <label for="ssh-user" class="fa fa-user fa-lg"></label>
                </div>
                <input type="text" id="ssh-user" value="pi" readonly/>
            </div>

            <div class="pw-data-row">
                <div class="pw-data-label">
                    <label for="ssh-pw" class="fa fa-key fa-lg"></label>
                </div>
                <input type="text" id="ssh-pw" value="{$passwords['ssh_pw']}" readonly/>
            </div>
        </div>
    </div>
</div>

<div id="buttons">
    <p>
        <button id="printButton"><i class="fa fa-print"></i> Print</button>
    </p>
    <p>
        <button id="button-next"
                class="primary"
                disabled
                title="Make sure you read the notice above and stored the passwords">
            <i class="fa fa-chevron-right"></i>
            Continue (30)
        </button>
    </p>
</div>

<!-- Only shown when printing -->
<div id="print">
    <img id="logo" src="/packages/sequry/passdora/bin/img/Passdora_Logo.png"/>
    <p>
        <b>Passdora</b><br>
        Username: admin<br>
        Password: {$passwords['quiqqer_pw']}
    </p>
    <p>
        <b>Restore</b><br>
        Restore-Key: {$restore_key}
    </p>
    <p>
        <b>SSH</b><br>
        Username: pi<br>
        Password: {$passwords['ssh_pw']}
    </p>
</div>

<script type="text/javascript" src="/packages/sequry/passdora/bin/js/general.js"></script>
<script type="text/javascript" src="/packages/sequry/passdora/bin/js/info.js"></script>
