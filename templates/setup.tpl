<div id="note">
    <i id="note-icon" class="fa fa-question fa-3x"></i>
    <div id="note-text">
        Here you can set up your system configuration.
    </div>
</div>


<div id="passwords">
    <div class="password-section" style="height: initial">
        <!-- Hostname -->
        <div class="pw-header">
            Hostname:
        </div>
        <div class="pw-data">
            <div class="pw-data-row" id="row-hostname">
                <div class="pw-data-label">
                    <label for="hostname" class="fa fa-server fa-lg"></label>
                </div>
                <input type="text" id="hostname" value="passdora"/>
            </div>
        </div>


        <!-- SSH -->
        <div class="pw-header">
            SSH:
        </div>
        <div class="pw-data">
            <div class="pw-data-row" id="row-dhcp">
                <div class="pw-data-label">
                    <label for="ssh-enabled" class="fa fa-power-off fa-lg"></label>
                </div>
                <input type="checkbox" id="ssh-enabled"/>
            </div>
        </div>


        <!-- DHCP -->
        <div class="pw-header">
            DHCP:
        </div>
        <div class="pw-data">
            <div class="pw-data-row" id="row-dhcp">
                <div class="pw-data-label">
                    <label for="dhcp-enabled" class="fa fa-power-off fa-lg"></label>
                </div>
                <input type="checkbox" id="dhcp-enabled" checked/>
            </div>
        </div>

        <!-- IP -->
        <div class="pw-data">
            <div class="pw-data-row" id="row-ip" style="display: none;">
                <div class="pw-data-label">
                    <label for="ip" class="fa fa-sitemap fa-lg"></label>
                </div>
                <input type="text" id="ip" value="169.254.1.2" placeholder="IP"/>
            </div>
        </div>

        <!-- Subnetmask -->
        <div class="pw-data">
            <div class="pw-data-row" id="row-subnetmask" style="display: none;">
                <div class="pw-data-label">
                    <label for="subnetmask" class="fa fa-sitemap fa-lg"></label>
                </div>
                <input type="text" id="subnetmask" value="255.255.0.0" placeholder="Subnetmask"/>
            </div>
        </div>
    </div>

    <!-- WiFi -->
    <div class="password-section">
        <div class="pw-header">
            WiFi:
        </div>

        <div class="pw-data">
            <div class="pw-data-row" id="row-wifi-enabled">
                <div class="pw-data-label">
                    <label for="wifi-enabled" class="fa fa-power-off fa-lg"></label>
                </div>
                <input type="checkbox" id="wifi-enabled"/>
            </div>

            <div class="pw-data-row" id="row-wifi-ssid" style="display: none;">
                <div class="pw-data-label">
                    <label for="wifi-ssid" class="fa fa-wifi fa-lg"></label>
                </div>
                <input type="text" id="wifi-ssid" placeholder="SSID" value=""/>
            </div>

            <div class="pw-data-row" id="row-wifi-password" style="display: none;">
                <div class="pw-data-label">
                    <label for="wifi-password" class="fa fa-key fa-lg"></label>
                </div>
                <input type="password" id="wifi-password" placeholder="Password" value=""/>
            </div>
        </div>
    </div>
</div>


<div id="buttons">
    <p>
        <button id="button-confirm" class="primary">
            <i class="fa fa-check"></i>
            Confirm
        </button>
    </p>
</div>


<script type="text/javascript" src="/packages/sequry/passdora/bin/js/general.js"></script>
<script type="text/javascript" src="/packages/sequry/passdora/bin/js/setup.js"></script>
